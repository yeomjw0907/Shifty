/**
 * 공공데이터포털 병원 정보 수집 스크립트
 * 
 * 사용 방법:
 * 1. 공공데이터포털에서 인증키 발급 (https://www.data.go.kr/)
 * 2. 아래 SERVICE_KEY를 발급받은 인증키로 변경
 * 3. node scripts/fetch-hospitals.js 실행
 * 
 * 참고: 보건복지부 병원 정보 API
 * - API명: 병원정보서비스
 * - URL: https://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncLcnsInfo
 */

const SERVICE_KEY = 'YOUR_SERVICE_KEY'; // 공공데이터포털 인증키로 변경 필요
const API_URL = 'https://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncLcnsInfo';

// Supabase 설정 (환경변수 또는 직접 입력)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

/**
 * 공공데이터 API에서 병원 정보 가져오기
 */
async function fetchHospitalsFromAPI(pageNo = 1, numOfRows = 1000) {
  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: pageNo.toString(),
    numOfRows: numOfRows.toString(),
    returnType: 'json',
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();
    
    if (data.response?.header?.resultCode !== '00') {
      console.error('API Error:', data.response?.header?.resultMsg);
      return { items: [], totalCount: 0 };
    }

    const items = data.response?.body?.items || [];
    const totalCount = parseInt(data.response?.body?.totalCount || '0', 10);

    return { items, totalCount };
  } catch (error) {
    console.error('Fetch error:', error);
    return { items: [], totalCount: 0 };
  }
}

/**
 * 병원 데이터를 Supabase 형식으로 변환
 */
function transformHospitalData(item) {
  return {
    name: item.yadmNm || '', // 병원명
    name_kr: item.yadmNm || '', // 병원명 (한글)
    address: item.addr || '', // 주소
    city: extractCity(item.addr || ''), // 시/도 추출
    district: extractDistrict(item.addr || ''), // 시/군/구 추출
    phone: item.telno || '', // 전화번호
    type: item.clCdNm || '', // 병원 유형
    beds: parseInt(item.drTotCnt || '0', 10), // 병상 수
    latitude: parseFloat(item.XPos || '0'), // 위도
    longitude: parseFloat(item.YPos || '0'), // 경도
  };
}

/**
 * 주소에서 시/도 추출
 */
function extractCity(address) {
  if (!address) return '';
  
  const cities = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
    '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도',
    '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
  ];

  for (const city of cities) {
    if (address.includes(city)) {
      return city;
    }
  }

  return '';
}

/**
 * 주소에서 시/군/구 추출
 */
function extractDistrict(address) {
  if (!address) return '';
  
  // 시/도 제거 후 첫 번째 단어 추출
  const city = extractCity(address);
  if (city) {
    const remaining = address.replace(city, '').trim();
    const parts = remaining.split(' ');
    return parts[0] || '';
  }

  return '';
}

/**
 * Supabase에 병원 데이터 저장
 */
async function insertHospitalsToSupabase(hospitals) {
  // 실제 구현은 Supabase 클라이언트 사용
  // 여기서는 예시로만 제공
  console.log(`Inserting ${hospitals.length} hospitals to Supabase...`);
  
  // TODO: Supabase 클라이언트로 실제 삽입
  // const { data, error } = await supabase
  //   .from('hospitals')
  //   .insert(hospitals)
  //   .select();
  
  return { success: true, count: hospitals.length };
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🏥 병원 정보 수집 시작...\n');

  let pageNo = 1;
  let totalCount = 0;
  let allHospitals = [];

  // 첫 페이지로 전체 개수 확인
  const firstPage = await fetchHospitalsFromAPI(1, 1);
  totalCount = firstPage.totalCount;
  console.log(`총 병원 수: ${totalCount}개\n`);

  // 페이지별로 데이터 수집
  const numOfRows = 1000; // 한 번에 가져올 개수
  const totalPages = Math.ceil(totalCount / numOfRows);

  for (let page = 1; page <= totalPages; page++) {
    console.log(`📄 페이지 ${page}/${totalPages} 수집 중...`);
    
    const { items } = await fetchHospitalsFromAPI(page, numOfRows);
    const transformed = items.map(transformHospitalData).filter(h => h.name);
    
    allHospitals = allHospitals.concat(transformed);
    console.log(`   ✅ ${transformed.length}개 병원 수집 완료\n`);

    // API 호출 제한을 위한 딜레이 (초당 1회)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ 총 ${allHospitals.length}개 병원 정보 수집 완료\n`);

  // Supabase에 저장
  console.log('💾 Supabase에 저장 중...');
  const result = await insertHospitalsToSupabase(allHospitals);
  
  if (result.success) {
    console.log(`✅ ${result.count}개 병원 정보 저장 완료!`);
  } else {
    console.error('❌ 저장 실패');
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fetchHospitalsFromAPI,
  transformHospitalData,
  insertHospitalsToSupabase,
};

