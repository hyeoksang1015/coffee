// 브랜드 이름·연락처. 포트폴리오용 가상 브랜드라 사업자 정보와 연락처는 실제 번호와 겹치지 않게 0 으로 채운다.
export const site = {
  name: "LowWave Coffee",
  nameKo: "로우웨이브 커피",
  tagline: "Roastery & Lab",
  description: "산지의 떼루아를 정밀한 로스팅으로 옮기는 스페셜티 커피 로스터리. 싱글 오리진·시그니처 블렌드 원두와 카페 납품(B2B)을 소개하는 포트폴리오용 가상 브랜드 사이트입니다.",
  address: "서울시 마포구 독막로 로우웨이브 아틀리에",
  hours: "09:00 - 18:00 (월-금)",
  b2bPhone: "02-000-0000",
  email: "hello@example.com",
  company: "주식회사 로우웨이브 (가상)",
  bizNo: "000-00-00000",
  mailOrderNo: "제0000-서울마포-0000호",
  /** 이 금액 이상 주문하면 배송비가 없다(시안 문구). 미만이면 shippingFee 를 더한다. */
  freeShipping: 30000,
  shippingFee: 3000,
};

export const nav = [
  { href: "/", label: "Brand & Story" },
  { href: "/beans/", label: "Beans Shop" },
  { href: "/wholesale/", label: "B2B Wholesale" },
];

export const won = (n: number) => `₩${n.toLocaleString("ko-KR")}`;
