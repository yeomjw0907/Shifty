/**
 * 병원 데이터 Excel 파일을 Supabase에 임포트하는 스크립트
 * 
 * 사용 방법:
 * 1. Excel 파일을 scripts/hospitals.xlsx로 저장
 * 2. npm install xlsx (필요시)
 * 3. node scripts/import-hospitals-from-excel.js
 */

// CommonJS 형식으로 변경 (Node.js 환경)
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('❌ 환경 변수를 설정해주세요:');
  console.error('   SUPABASE_URL=your_url');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Excel 파일 목록 (scripts/ 폴더에 저장)
const excelFiles = [
  '01_01_01_P.xlsx',
  '01_01_02_P.xlsx',
  '01_01_03_P.xlsx',
  '01_01_04_P.xlsx',
  '01_01_07_P.xlsx',
  '01_01_08_P.xlsx',
  '01_01_10_P.xlsx',
];

// scripts 폴더 경로
const scriptsDir = path.join(__dirname, '..', 'scripts');

// Excel 파일 읽기
function readExcelFile(filePath) {
  try {
    console.log(`📖 Excel 파일 읽기: ${path.basename(filePath)}`);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  파일을 찾을 수 없습니다: ${filePath}`);
      return [];
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 사용
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`   ✅ 시트 "${sheetName}" 읽기 완료`);
    
    // JSON으로 변환
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      defval: null, // 빈 셀은 null로 처리
      raw: false // 날짜를 문자열로 변환
    });
    
    console.log(`   📊 ${data.length}개 행 발견`);
    
    return data;
  } catch (error) {
    console.error(`❌ Excel 파일 읽기 오류 (${path.basename(filePath)}):`, error.message);
    return []; // 오류 발생 시 빈 배열 반환
  }
}

// 모든 Excel 파일 읽기
function readAllExcelFiles() {
  const allData = [];
  
  excelFiles.forEach((fileName) => {
    const filePath = path.join(scriptsDir, fileName);
    const data = readExcelFile(filePath);
    allData.push(...data);
  });
  
  console.log(`\n📊 전체 ${allData.length}개 행 발견\n`);
  return allData;
}

// Excel 데이터를 hospitals 테이블 형식으로 변환
function transformHospitalData(excelRow) {
  // Excel 컬럼명에 따라 매핑 (공공데이터 Excel 파일 구조)
  // 각 파일의 컬럼이 다를 수 있으므로 유연하게 처리
  const hospital = {};

  // 사업장명 (필수) -> name_kr
  // 가능한 컬럼명: 사업장명, 개방서비스명
  const nameColumns = ['사업장명', '개방서비스명'];
  for (const col of nameColumns) {
    if (excelRow[col]) {
      hospital.name_kr = String(excelRow[col]).trim();
      hospital.name = hospital.name_kr; // name_kr을 name으로도 사용
      break;
    }
  }

  // 주소 관련 컬럼들 (파일마다 다를 수 있음)
  // 위치(GPS정보)에서 주소 추출 시도
  const addressColumns = ['주소', '소재지전체주소', '도로명전체주소', '지번주소', '위치(GPS정보)(GPS정보)', '위치(GPS정보)'];
  for (const col of addressColumns) {
    if (excelRow[col]) {
      const value = String(excelRow[col]).trim();
      // GPS 정보가 포함된 경우 주소 부분만 추출
      if (value.includes('(') && value.includes(')')) {
        // "주소 (위도, 경도)" 형식인 경우 주소 부분만 추출
        const addressPart = value.split('(')[0].trim();
        if (addressPart) {
          hospital.address = addressPart;
        }
      } else {
        hospital.address = value;
      }
      if (hospital.address) break;
    }
  }

  // 시도 관련 컬럼들
  const cityColumns = ['시도명', '시도', '시도코드명'];
  for (const col of cityColumns) {
    if (excelRow[col]) {
      hospital.city = String(excelRow[col]).trim();
      break;
    }
  }

  // 시군구 관련 컬럼들
  const districtColumns = ['시군구명', '시군구', '시군구코드명'];
  for (const col of districtColumns) {
    if (excelRow[col]) {
      hospital.district = String(excelRow[col]).trim();
      break;
    }
  }

  // 전화번호 관련 컬럼들
  const phoneColumns = ['전화번호', '대표전화', '전화'];
  for (const col of phoneColumns) {
    if (excelRow[col]) {
      hospital.phone = String(excelRow[col]).trim();
      break;
    }
  }

  // 업종 관련 컬럼들
  // 의료기관종별명, 서비스유형 등
  const typeColumns = ['업종', '업종명', '업종코드명', '의료기관종별명', '요기관종별 의료인수', '서비스유형'];
  for (const col of typeColumns) {
    if (excelRow[col]) {
      const value = String(excelRow[col]).trim();
      // "요기관종별 의료인수" 같은 복합 컬럼에서 업종만 추출
      if (col === '요기관종별 의료인수' && value.includes(' ')) {
        hospital.type = value.split(' ')[0].trim();
      } else {
        hospital.type = value;
      }
      if (hospital.type) break;
    }
  }

  // 병상수 관련 컬럼들
  // 병상수, 허가병상수 등
  const bedsColumns = ['병상수', '병상', '총병상수', '허가병상수'];
  for (const col of bedsColumns) {
    if (excelRow[col]) {
      const value = String(excelRow[col]).trim();
      hospital.beds = parseInt(value) || null;
      if (hospital.beds) break;
    }
  }

  // GPS 정보에서 위도/경도 추출
  // 위치(GPS정보)(GPS정보) 컬럼에서 좌표 추출
  const gpsColumns = ['위치(GPS정보)(GPS정보)', '위치(GPS정보)'];
  for (const col of gpsColumns) {
    if (excelRow[col]) {
      const value = String(excelRow[col]).trim();
      // "주소 (위도, 경도)" 또는 "위도, 경도" 형식 파싱
      const gpsMatch = value.match(/\(([0-9.]+),\s*([0-9.]+)\)/);
      if (gpsMatch) {
        hospital.latitude = parseFloat(gpsMatch[1]) || null;
        hospital.longitude = parseFloat(gpsMatch[2]) || null;
      } else {
        // 쉼표로 구분된 경우
        const parts = value.split(',');
        if (parts.length >= 2) {
          const lat = parseFloat(parts[parts.length - 2].trim());
          const lng = parseFloat(parts[parts.length - 1].trim());
          if (!isNaN(lat) && !isNaN(lng)) {
            hospital.latitude = lat;
            hospital.longitude = lng;
          }
        }
      }
      if (hospital.latitude && hospital.longitude) break;
    }
  }

  // 위도 관련 컬럼들 (별도 컬럼이 있는 경우)
  if (!hospital.latitude) {
    const latColumns = ['위도', '좌표Y', '위도(WGS84)'];
    for (const col of latColumns) {
      if (excelRow[col]) {
        const value = String(excelRow[col]).trim();
        hospital.latitude = parseFloat(value) || null;
        if (hospital.latitude) break;
      }
    }
  }

  // 경도 관련 컬럼들 (별도 컬럼이 있는 경우)
  if (!hospital.longitude) {
    const lngColumns = ['경도', '좌표X', '경도(WGS84)'];
    for (const col of lngColumns) {
      if (excelRow[col]) {
        const value = String(excelRow[col]).trim();
        hospital.longitude = parseFloat(value) || null;
        if (hospital.longitude) break;
      }
    }
  }

  // 필수 필드 확인 (사업장명 또는 개방서비스명이 없으면 스킵)
  if (!hospital.name_kr) {
    return null;
  }

  return hospital;
}

// Supabase에 병원 데이터 삽입
async function importHospitals(hospitals) {
  console.log(`\n📤 Supabase에 ${hospitals.length}개 병원 데이터 삽입 시작...\n`);

  const batchSize = 100; // 한 번에 100개씩 삽입
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  for (let i = 0; i < hospitals.length; i += batchSize) {
    const batch = hospitals.slice(i, i + batchSize);
    
    try {
      // 중복 체크 없이 삽입 (중복은 무시)
      // name_kr에 UNIQUE 제약 조건이 없으므로 onConflict 사용 불가
      // 대신 개별 삽입으로 중복 에러 처리
      const results = await Promise.allSettled(
        batch.map(async (hospital) => {
          const { data, error } = await supabase
            .from('hospitals')
            .insert([hospital])
            .select();

          if (error) {
            // 중복 에러는 무시 (23505 = unique_violation)
            if (error.code === '23505') {
              return { success: false, skipped: true };
            }
            throw error;
          }
          return { success: true, data };
        })
      );

      // 결과 집계
      let batchSuccess = 0;
      let batchSkipped = 0;
      let batchErrors = 0;

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            batchSuccess++;
          } else if (result.value.skipped) {
            batchSkipped++;
          } else {
            batchErrors++;
          }
        } else {
          batchErrors++;
          // 중복이 아닌 실제 에러만 출력
          if (!result.reason?.code || result.reason.code !== '23505') {
            console.error(`   ⚠️  행 ${i + idx + 1} 오류:`, result.reason?.message || result.reason);
          }
        }
      });

      successCount += batchSuccess;
      skipCount += batchSkipped;
      errorCount += batchErrors;

      if (batchSuccess > 0) {
        console.log(`✅ 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(hospitals.length / batchSize)}: ${batchSuccess}개 삽입, ${batchSkipped}개 스킵, ${batchErrors}개 오류`);
      }
    } catch (error) {
      console.error(`❌ 배치 ${Math.floor(i / batchSize) + 1} 예외:`, error.message);
      errorCount += batch.length;
    }
  }

  console.log(`\n📊 결과:`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 오류: ${errorCount}개`);
  console.log(`   ⏭️  스킵: ${skipCount}개`);
}

// 메인 실행 함수
async function main() {
  try {
    console.log('🚀 병원 데이터 임포트 시작\n');
    console.log(`📁 처리할 파일: ${excelFiles.length}개\n`);

    // 1. 모든 Excel 파일 읽기
    const excelData = readAllExcelFiles();

    if (excelData.length === 0) {
      console.error('❌ 읽을 수 있는 데이터가 없습니다.');
      console.error('   Excel 파일이 scripts/ 폴더에 있는지 확인하세요.');
      process.exit(1);
    }

    // 2. 데이터 변환
    console.log('🔄 데이터 변환 중...');
    const hospitals = excelData
      .map(transformHospitalData)
      .filter(h => h !== null); // null 제거

    console.log(`✅ ${hospitals.length}개 병원 데이터 변환 완료`);

    // 3. Excel 파일의 실제 컬럼명 확인 (첫 번째 파일 기준)
    if (excelData.length > 0) {
      console.log('\n📋 Excel 파일 컬럼명 (첫 번째 행 기준):');
      const firstRow = excelData[0];
      const columns = Object.keys(firstRow);
      console.log(`   총 ${columns.length}개 컬럼 발견`);
      console.log('   컬럼명:', columns.join(', '));
    }

    // 4. 샘플 데이터 출력 (처음 5개)
    if (hospitals.length > 0) {
      console.log('\n📋 샘플 데이터 (처음 5개):');
      hospitals.slice(0, 5).forEach((h, i) => {
        console.log(`\n${i + 1}. ${h.name_kr || h.name}`);
        console.log(`   주소: ${h.address || 'N/A'}`);
        console.log(`   시도: ${h.city || 'N/A'}`);
        console.log(`   시군구: ${h.district || 'N/A'}`);
        console.log(`   업종: ${h.type || 'N/A'}`);
        console.log(`   병상수: ${h.beds || 'N/A'}`);
        console.log(`   좌표: ${h.latitude && h.longitude ? `${h.latitude}, ${h.longitude}` : 'N/A'}`);
      });
    }

    // 5. 컬럼 통계 출력
    console.log('\n📊 데이터 통계:');
    const stats = {
      withAddress: hospitals.filter(h => h.address).length,
      withCity: hospitals.filter(h => h.city).length,
      withDistrict: hospitals.filter(h => h.district).length,
      withPhone: hospitals.filter(h => h.phone).length,
      withType: hospitals.filter(h => h.type).length,
      withBeds: hospitals.filter(h => h.beds).length,
      withCoordinates: hospitals.filter(h => h.latitude && h.longitude).length,
    };
    console.log(`   주소: ${stats.withAddress}/${hospitals.length} (${Math.round(stats.withAddress/hospitals.length*100)}%)`);
    console.log(`   시도: ${stats.withCity}/${hospitals.length} (${Math.round(stats.withCity/hospitals.length*100)}%)`);
    console.log(`   시군구: ${stats.withDistrict}/${hospitals.length} (${Math.round(stats.withDistrict/hospitals.length*100)}%)`);
    console.log(`   전화번호: ${stats.withPhone}/${hospitals.length} (${Math.round(stats.withPhone/hospitals.length*100)}%)`);
    console.log(`   업종: ${stats.withType}/${hospitals.length} (${Math.round(stats.withType/hospitals.length*100)}%)`);
    console.log(`   병상수: ${stats.withBeds}/${hospitals.length} (${Math.round(stats.withBeds/hospitals.length*100)}%)`);
    console.log(`   좌표: ${stats.withCoordinates}/${hospitals.length} (${Math.round(stats.withCoordinates/hospitals.length*100)}%)`);

    // 6. 사용자 확인
    console.log(`\n⚠️  ${hospitals.length}개 병원 데이터를 Supabase에 삽입하시겠습니까?`);
    console.log('   (실제로는 Excel 파일을 확인한 후 실행하세요)');

    // 7. Supabase에 삽입
    await importHospitals(hospitals);

    console.log('\n✅ 병원 데이터 임포트 완료!');
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main();

