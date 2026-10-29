# mockups

목업 HTML 모음. GitHub Pages로 배포됩니다.

## 사용법

1. HTML 파일을 이 디렉토리에 추가
2. **`</body>` 바로 앞에 아래 한 줄 삽입** (워터마크 필수):
   ```html
   <script src="./watermark.js" defer></script>
   ```
3. `index.html`의 목록에 링크 추가 (선택)
4. 커밋 & 푸시하면 자동 배포

## 배포 URL

https://sunny-jang.github.io/mockups/

## 워터마크

기본 워터마크 문구는 `IDEAL AI` 입니다. 다른 문구가 필요하면 스크립트 태그에 `data-text` 를 붙입니다:
```html
<script src="./watermark.js" data-text="EUNSEON STUDIO" defer></script>
```
(기존 EUNSEON STUDIO 목업은 이렇게 지정되어 있어 그대로 보입니다.) 스타일을 바꾸려면 `watermark.js` 한 곳만 수정하면 됩니다.
하위 폴더에 둔 문서는 `../watermark.js` 로 불러오고, 워터마크가 필요 없는 문서(예: `theflow_manual/` 사용 설명서)는 넣지 않습니다.
