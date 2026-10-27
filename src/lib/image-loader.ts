// next/image 는 basePath 를 이미지 주소에 붙이지 않는다. 이미지는 미리 webp 로 만들어 두었으니 경로만 붙인다.
// width 를 쓰지 않아 개발 서버에서만 경고가 한 번 뜬다.
export default function imageLoader({ src }: { src: string; width: number }) {
  return (process.env.BASE_PATH ?? "") + src;
}
