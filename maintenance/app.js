(() => {
  'use strict';
  const endpoint = 'https://vero-maintenance-request.esunbest.chatgpt.site/api/requests';
  const brand = document.body.dataset.brand;
  const tasks = [
    {id:'text',title:'텍스트 수정',rate:10000,unit:'곳'}, {id:'image',title:'이미지 교체',rate:20000,unit:'장'},
    {id:'update',title:'업데이트',rate:30000,unit:'건'}, {id:'security',title:'보안 점검',rate:50000,unit:'회'},
    {id:'bug',title:'오류 수정',rate:50000,unit:'건'}, {id:'feature',title:'기능 추가 / 기타',rate:100000,unit:'건'}
  ];
  const form = document.querySelector('#request-form');
  const selected = new Set();
  const quantities = Object.fromEntries(tasks.map(t=>[t.id,1]));
  const money = n => n.toLocaleString('ko-KR');
  let quoted = false, busy = false, requestId = '', priority = 'normal';
  const error = document.querySelector('#form-error');
  const quoteButtons = [...document.querySelectorAll('[data-estimate]')];
  const summary = document.querySelector('#selected-summary');
  const result = document.querySelector('#quote-result');
  const slot = document.querySelector('#submit-slot');
  form.querySelector('[name=date]').min = new Date().toLocaleDateString('en-CA');
  const taskControls = new Map();
  function setSelected(id, on) {
    const {button,input,minus,plus,wrapper}=taskControls.get(id);
    on ? selected.add(id) : selected.delete(id);
    button.classList.toggle('selected',on); wrapper.classList.toggle('is-selected',on);
    button.setAttribute('aria-pressed',String(on));
    button.querySelector('.check').textContent=on?'✓':'';
    input.disabled=!on;minus.disabled=!on||quantities[id]<=1;plus.disabled=!on||quantities[id]>=100;
    quoted=false;error.textContent='';render();
  }
  document.querySelectorAll('[data-task]').forEach(button => {
    const task=tasks.find(t=>t.id===button.dataset.task);
    const wrapper=document.createElement('div');wrapper.className='task-card';
    button.replaceWith(wrapper);wrapper.append(button);
    const row=document.createElement('div');row.className='card-quantity';
    const label=document.createElement('label');label.textContent='수량';label.htmlFor=`qty-${task.id}`;
    const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label',`${task.title} 수량 줄이기`);
    const input=document.createElement('input');input.type='number';input.min='1';input.max='100';input.value='1';input.id=`qty-${task.id}`;input.dataset.quantity=task.id;input.setAttribute('aria-label',`${task.title} 수량`);
    const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.setAttribute('aria-label',`${task.title} 수량 늘리기`);
    const unit=document.createElement('span');unit.textContent=task.unit;unit.className='quantity-unit';
    row.append(label,minus,input,plus,unit);wrapper.append(row);
    input.disabled=true;minus.disabled=true;plus.disabled=true;
    taskControls.set(task.id,{button,input,minus,plus,wrapper});
    button.addEventListener('click',()=>setSelected(task.id,!selected.has(task.id)));
    function update(){
      const value=Number(input.value);
      if(Number.isInteger(value)&&value>=1&&value<=100)quantities[task.id]=value;
      minus.disabled=quantities[task.id]<=1;plus.disabled=quantities[task.id]>=100;
      quoted=false;error.textContent='';render();
    }
    input.addEventListener('input',update);
    minus.addEventListener('click',()=>{input.value=String(Math.max(1,(Number(input.value)||1)-1));update();});
    plus.addEventListener('click',()=>{input.value=String(Math.min(100,(Number(input.value)||1)+1));update();});
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
  document.querySelectorAll('[data-task]').forEach(button=>{
    const task=tasks.find(t=>t.id===button.dataset.task);
    const price=document.createElement('small');price.className='task-rate';price.textContent=`${money(task.rate)}원 / ${task.unit}${['bug','feature'].includes(task.id)?'부터':''}`;button.append(price);
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
      items.forEach(t=>{
        const li=document.createElement('li');const check=document.createElement('span');check.textContent='✓';li.append(check,document.createTextNode(t.title));
        const detail=document.createElement('small');detail.className='summary-quantity';detail.textContent=`${quantities[t.id]}${t.unit} × ${money(t.rate)}원 = ${money(quantities[t.id]*t.rate)}원`;li.append(detail);list.append(li);
      });
      summary.append(list);
    } else {const p=document.createElement('p');p.textContent='왼쪽에서 필요한 작업을 선택하면 이곳에 요청 내역이 표시됩니다.';summary.append(p);}
    document.querySelectorAll('.workflow>span')[1].classList.toggle('active',quoted);
    document.querySelector('.quote-badge').textContent = quoted ? (selected.has('bug') || selected.has('feature') ? '상세 견적 필요' : '단건 유지보수 예상견적') : '단건 유지보수 시작 가격';
    quoteButtons.forEach(b=>{b.innerHTML=(quoted?'예상견적 다시 확인':'예상견적 받기')+'<span>↗</span>';b.classList.toggle('secondary',quoted);});
    const subtotal=items.reduce((sum,t)=>sum+t.rate*quantities[t.id],0);
    const total=Math.max(50000,subtotal),custom=selected.has('bug')||selected.has('feature');
    document.querySelector('.quote-amount strong').textContent=money(quoted?total:50000);
    document.querySelector('.quote-amount>span').textContent=quoted?(custom?'원부터':'원'):'원부터';
    result.replaceChildren();slot.replaceChildren();
    if(quoted){
      result.className='quote-result';const b=document.createElement('b');b.textContent='예상견적이 준비되었습니다.';
      const p=document.createElement('p');p.textContent=selected.has('bug')||selected.has('feature')?'오류 수정·기능 추가는 참고 단가부터 계산합니다. 난이도와 기능 범위에 따라 최종 견적이 달라질 수 있습니다.':'선택한 작업의 참고 단가 × 수량으로 계산했습니다. 최종 금액은 작업 범위 확인 후 확정합니다.';
      result.append(b,p);
      const breakdown=document.createElement('div');breakdown.className='cost-breakdown';
      function costRow(label,amount,cls=''){const row=document.createElement('div');row.className=cls;const span=document.createElement('span');span.textContent=label;const strong=document.createElement('strong');strong.textContent=amount;row.append(span,strong);breakdown.append(row);}
      items.forEach(t=>costRow(`${t.title} ${quantities[t.id]}${t.unit}`,`${money(t.rate*quantities[t.id])}원`));
      if(subtotal<50000)costRow('최소 접수금액 보정',`+${money(50000-subtotal)}원`);
      costRow('예상 합계',`${money(total)}원${custom?'부터':''}`,'cost-total');result.append(breakdown);
      const submit=document.createElement('button');submit.type='button';submit.className='primary submit';submit.innerHTML='이 견적으로 요청서 제출 <span>→</span>';submit.addEventListener('click',()=>form.requestSubmit());slot.append(submit);
    }
  }
  function calculate(){
    if(!selected.size){error.textContent='요청하실 작업을 하나 이상 선택해 주세요.';document.querySelector('[data-task]').focus();return;}
    for(const input of document.querySelectorAll('[data-quantity]:not(:disabled)')){
      const value=Number(input.value);
      if(!Number.isInteger(value)||value<1||value>100){error.textContent='작업 수량은 1~100 사이의 정수로 입력해 주세요.';input.focus();return;}
      quantities[input.dataset.quantity]=value;
    }
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
      const response=await fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,id:requestId,brand,tasks:[...selected],quantities:Object.fromEntries([...selected].map(id=>[id,quantities[id]])),priority,consent:values.consent==='on'})});
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
