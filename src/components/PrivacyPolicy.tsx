import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="glass-card rounded-3xl p-6 md:p-8 h-full md:h-auto md:max-h-[80vh] flex flex-col toss-shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-slate-900 mb-1">개인정보 처리방침</h2>
                  <p className="text-sm text-slate-600">주식회사 98점7도</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-sm text-slate-700">
                {/* 1. 개인정보의 처리 목적 */}
                <section>
                  <h3 className="text-slate-900 mb-3">1. 개인정보의 처리 목적</h3>
                  <p className="mb-2">
                    주식회사 98점7도(이하 "회사")는 Shifty 서비스(이하 "서비스") 제공을 위해 다음과 같은 목적으로 개인정보를 처리합니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
                    <li>회원가입 및 회원 관리</li>
                    <li>교대근무 일정 관리 서비스 제공</li>
                    <li>팀 협업 및 일정 공유 기능 제공</li>
                    <li>서비스 부정 이용 방지 및 고객 문의 대응</li>
                    <li>서비스 개선 및 신규 서비스 개발</li>
                  </ul>
                </section>

                {/* 2. 수집하는 개인정보 항목 */}
                <section>
                  <h3 className="text-slate-900 mb-3">2. 수집하는 개인정보 항목</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-800 mb-1">
                        <strong>필수 항목:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2 text-slate-600">
                        <li>이메일 주소</li>
                        <li>비밀번호 (암호화 저장)</li>
                        <li>이름</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-slate-800 mb-1">
                        <strong>선택 항목:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2 text-slate-600">
                        <li>근무 병원명</li>
                        <li>소속 부서/병동</li>
                        <li>직책</li>
                        <li>연락처</li>
                        <li>프로필 사진</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-slate-800 mb-1">
                        <strong>자동 수집 항목:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2 text-slate-600">
                        <li>서비스 이용 기록</li>
                        <li>접속 로그, IP 주소</li>
                        <li>기기 정보 (브라우저 종류, OS 등)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 3. 개인정보의 보유 및 이용기간 */}
                <section>
                  <h3 className="text-slate-900 mb-3">3. 개인정보의 보유 및 이용기간</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
                    <li>
                      <strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령에 따라 일정 기간 보관)
                    </li>
                    <li>
                      <strong>일정 데이터:</strong> 사용자가 삭제하거나 회원 탈퇴 시까지
                    </li>
                    <li>
                      <strong>로그 기록:</strong> 3개월 (서비스 부정 이용 방지 목적)
                    </li>
                  </ul>
                </section>

                {/* 4. 개인정보의 제3자 제공 */}
                <section>
                  <h3 className="text-slate-900 mb-3">4. 개인정보의 제3자 제공</h3>
                  <p className="text-slate-600">
                    회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
                    다만, 다음의 경우에는 예외로 합니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600 mt-2">
                    <li>이용자가 사전에 동의한 경우</li>
                    <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 요청이 있는 경우</li>
                  </ul>
                </section>

                {/* 5. 개인정보 처리의 위탁 */}
                <section>
                  <h3 className="text-slate-900 mb-3">5. 개인정보 처리의 위탁</h3>
                  <p className="text-slate-600 mb-2">
                    회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다:
                  </p>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                    <ul className="space-y-2 text-slate-600">
                      <li>
                        <strong>수탁업체:</strong> Supabase Inc.
                      </li>
                      <li>
                        <strong>위탁 업무:</strong> 데이터 저장 및 사용자 인증
                      </li>
                      <li>
                        <strong>보유 기간:</strong> 회원 탈퇴 시 또는 위탁 계약 종료 시까지
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 6. 이용자의 권리 */}
                <section>
                  <h3 className="text-slate-900 mb-3">6. 정보주체의 권리·의무 및 행사방법</h3>
                  <p className="text-slate-600 mb-2">
                    이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
                    <li>개인정보 열람 요구</li>
                    <li>개인정보 정정·삭제 요구</li>
                    <li>개인정보 처리 정지 요구</li>
                    <li>회원 탈퇴 (개인정보 삭제)</li>
                  </ul>
                  <p className="text-slate-600 mt-3">
                    위 권리 행사는 서비스 내 설정 메뉴 또는 이메일(shifty@98point7.com)을 통해 가능합니다.
                  </p>
                </section>

                {/* 7. 개인정보의 파기 */}
                <section>
                  <h3 className="text-slate-900 mb-3">7. 개인정보의 파기</h3>
                  <p className="text-slate-600">
                    회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
                    지체없이 해당 개인정보를 파기합니다. 파기의 절차 및 방법은 다음과 같습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600 mt-2">
                    <li>
                      <strong>파기 절차:</strong> 불필요한 개인정보는 즉시 파기
                    </li>
                    <li>
                      <strong>파기 방법:</strong> 전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제
                    </li>
                  </ul>
                </section>

                {/* 8. 개인정보 보호책임자 */}
                <section>
                  <h3 className="text-slate-900 mb-3">8. 개인정보 보호책임자</h3>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <ul className="space-y-2 text-slate-700">
                      <li>
                        <strong>책임자:</strong> 개인정보 보호책임자
                      </li>
                      <li>
                        <strong>소속:</strong> 주식회사 98점7도
                      </li>
                      <li>
                        <strong>이메일:</strong> privacy@98point7.com
                      </li>
                      <li>
                        <strong>연락처:</strong> 문의는 이메일로 부탁드립니다
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 9. 개인정보의 안전성 확보 조치 */}
                <section>
                  <h3 className="text-slate-900 mb-3">9. 개인정보의 안전성 확보 조치</h3>
                  <p className="text-slate-600 mb-2">
                    회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
                    <li>비밀번호 암호화 저장 및 관리</li>
                    <li>해킹 등에 대비한 기술적 대책 (HTTPS, 방화벽 등)</li>
                    <li>개인정보 취급 직원의 최소화 및 교육</li>
                    <li>접근 권한 관리 및 접근 기록 보관</li>
                  </ul>
                </section>

                {/* 10. 개인정보 처리방침 변경 */}
                <section>
                  <h3 className="text-slate-900 mb-3">10. 개인정보 처리방침의 변경</h3>
                  <p className="text-slate-600">
                    본 개인정보 처리방침은 2025년 11월 3일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 
                    삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                  </p>
                </section>

                {/* Footer */}
                <section className="pt-4 border-t border-slate-200">
                  <p className="text-slate-600">
                    <strong>공고일자:</strong> 2025년 11월 3일
                  </p>
                  <p className="text-slate-600">
                    <strong>시행일자:</strong> 2025년 11월 3일
                  </p>
                  <p className="text-slate-600 mt-3">
                    <strong>주식회사 98점7도</strong>
                  </p>
                </section>
              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="w-full py-3 shifty-gradient text-white rounded-xl toss-shadow-lg hover:opacity-90 transition-opacity"
                >
                  확인
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
