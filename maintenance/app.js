(() => {
  'use strict';
  const endpoint = 'https://vero-maintenance-request.esunbest.chatgpt.site/api/requests';
  const brand = document.body.dataset.brand;
  const tasks = [
    {id:'text',title:'텍스트 수정'}, {id:'image',title:'이미지 교체'},
    {id:'update',title:'업데이트'}, {id:'security',title:'보안 점검'},
    {id:'bug',title:'오류 수정'}, {id:'feature',title:'기능 추가 / 기타'}
  ];
  const form = document.querySelector('#request-form');
  const selected = new Set();
  let quoted = false, busy = false, requestId = '', priority = 'normal';
  const error = document.querySelector('#form-error');
  const quoteButtons = [...document.querySelectorAll('[data-estimate]')];
  const summary = document.querySelector('#selected-summary');
  const result = document.querySelector('#quote-result');
  const slot = document.querySelector('#submit-slot');
  form.querySelector('[name=date]').min = new Date().toLocaleDateString('en-CA');
  document.querySelectorAll('[data-task]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.task;
      selected.has(id) ? selected.delete(id) : selected.add(id);
      button.classList.toggle('selected', selected.has(id));
      button.setAttribute('aria-pressed', String(selected.has(id)));
      button.querySelector('.check').textContent = selected.has(id) ? '✓' : '';
      quoted = false; error.textContent = ''; render();
    });
  });
  document.querySelectorAll('.segmented button').forEach((button,index) => {
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      priority = index === 0 ? 'normal' : 'urgent';
      document.querySelectorAll('.segmented button').forEach(b => {
        b.classList.toggle('on', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
    });
  });
  function render() {
    const items = tasks.filter(t => selected.has(t.id));
    summary.replaceChildren();
    const head = document.createElement('div');
    const title = document.createElement('strong');title.textContent = '요청 작업';
    const count = document.createElement('span');count.textContent = items.length ? `${items.length}개 선택` : '선택 전';
    head.append(title,count);summary.append(head);
    if(items.length){
      const list = document.createElement('ul');
      items.forEach(t=>{const li=document.createElement('li');const check=document.createElement('span');check.textContent='✓';li.append(check,document.createTextNode(t.title));list.append(li);});
      summary.append(list);
    } else {const p=document.createElement('p');p.textContent='왼쪽에서 필요한 작업을 선택하면 이곳에 요청 내역이 표시됩니다.';summary.append(p);}
    document.querySelectorAll('.workflow>span')[1].classList.toggle('active',quoted);
    document.querySelector('.quote-badge').textContent = quoted ? (selected.has('bug') || selected.has('feature') ? '상세 견적 필요' : '단건 유지보수 예상견적') : '단건 유지보수 시작 가격';
    quoteButtons.forEach(b=>{b.innerHTML=(quoted?'예상견적 다시 확인':'예상견적 받기')+'<span>↗</span>';b.classList.toggle('secondary',quoted);});
    result.replaceChildren();slot.replaceChildren();
    if(quoted){
      result.className='quote-result';const b=document.createElement('b');b.textContent='예상견적이 준비되었습니다.';
      const p=document.createElement('p');p.textContent=selected.has('bug')||selected.has('feature')?'오류 원인이나 기능 범위 확인이 필요해요. 5만 원은 유지보수 시작 가격이며, 최종 금액은 별도 안내합니다.':'선택한 작업은 유지보수 대상입니다. 전체 단건 요청 기준 5만 원부터이며, 분량과 난이도에 따라 달라집니다.';
      const small=document.createElement('small');small.textContent='항목별 단가는 공개되어 있지 않아 합산하지 않습니다.';result.append(b,p,small);
      const submit=document.createElement('button');submit.type='button';submit.className='primary submit';submit.innerHTML='이 견적으로 요청서 제출 <span>→</span>';submit.addEventListener('click',()=>form.requestSubmit());slot.append(submit);
    }
  }
  function calculate(){
    if(!selected.size){error.textContent='요청하실 작업을 하나 이상 선택해 주세요.';document.querySelector('[data-task]').focus();return;}
    quoted=true;error.textContent='';render();document.querySelector('#quote-card').scrollIntoView({behavior:'smooth',block:'center'});
  }
  quoteButtons.forEach(b=>b.addEventListener('click',calculate));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;if(!quoted){calculate();return;}
    if(!form.reportValidity())return;
    busy=true;error.textContent='';const button=slot.querySelector('button');button.disabled=true;button.textContent='접수 중…';
    requestId ||= crypto.randomUUID();
    const values=Object.fromEntries(new FormData(form));
    try {
      const response=await fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,id:requestId,brand,tasks:[...selected],priority,consent:values.consent==='on'})});
      let data;try{data=await response.json();}catch{throw new Error('접수 서버에 연결하지 못했습니다. 잠시 후 같은 요청으로 다시 시도해 주세요.');}
      if(!response.ok)throw new Error(data.error || '요청서를 접수하지 못했습니다.');
      if(!data.id)throw new Error('접수 결과를 확인하지 못했습니다. 같은 요청으로 다시 확인해 주세요.');
      const main=document.querySelector('main');main.replaceChildren();
      const section=document.createElement('section');section.className='success';
      section.innerHTML='<span class="eyebrow">REQUEST RECEIVED</span><div class="success-icon">✓</div><h1>요청서를<br>잘 받았습니다<span>.</span></h1><p>작업 내용을 확인한 후 입력하신 이메일로 안내드릴게요.</p><div class="receipt"><span>접수번호</span><code></code><span>Slack 알림</span><strong></strong></div><button class="primary" type="button">새 요청 작성하기 ↗</button>';
      section.querySelector('code').textContent=data.id;
      section.querySelector('.receipt strong').textContent=data.notification==='sent'?'전송 완료':data.notification==='pending'?'연결 대기 · 요청서는 저장되었습니다':'전송 확인 필요 · 요청서는 저장되었습니다';
      section.querySelector('button').addEventListener('click',()=>location.reload());main.append(section);window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){error.textContent=e instanceof TypeError?'접수 서버에 연결하지 못했습니다. 잠시 후 같은 요청으로 다시 시도해 주세요.':e.message;}
    finally{busy=false;if(button.isConnected){button.disabled=false;button.innerHTML='이 견적으로 요청서 제출 <span>→</span>';}}
  });
  window.addEventListener('pageshow',()=>{document.querySelectorAll('[data-task]').forEach(b=>b.setAttribute('aria-pressed',String(selected.has(b.dataset.task))));});
})();
