const Policy = () => {
    return (
        <div className="h-80 overflow-y-auto bg-muted/30 p-4 rounded-md text-sm leading-relaxed text-muted-foreground">
            <h3 className="font-bold text-foreground mb-2">제 1 조 (개인정보의 수집 항목 및 방법)</h3>
            <p className="mb-4">
                본 서비스는 회원가입 및 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.
                <br />
                <strong>1. 수집 항목 (직접 입력)</strong>: 이름, 이메일, 닉네임, 비밀번호, 프로필 이미지
                <br />
                <strong>2. 구글 로그인 시</strong>: 구글 계정 정보(이메일, 프로필 사진, 이름)
                <br />
                <strong>3. 자동 수집 항목</strong>: 서비스 이용 기록, 접속 로그, IP 주소, 쿠키
            </p>

            <h3 className="font-bold text-foreground mb-2">제 2 조 (개인정보의 이용 목적)</h3>
            <p className="mb-4">
                수집한 개인정보는 다음의 목적을 위해 활용됩니다.
                <br />
                - <strong>회원 관리</strong>: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량 회원 부정 이용 방지 및 가입 의사 확인
                <br />
                - <strong>서비스 제공</strong>: JWT 기반 인증 유지, 프로필 설정, 이용자 간 커뮤니케이션
            </p>

            <h3 className="font-bold text-foreground mb-2">제 3 조 (개인정보의 보유 및 이용기간)</h3>
            <p className="mb-4">
                회원의 개인정보는 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다. 단, 관계법령 및 부정 이용 방지를 위해 필요한 경우 내부 방침에 따라 일정 기간 보관할 수 있습니다.
            </p>

            <h3 className="font-bold text-foreground mb-2">제 4 조 (정보주체의 권리)</h3>
            <p>
                이용자는 언제든지 본인의 개인정보를 열람, 수정하거나 수집 동의 철회 및 회원 탈퇴를 요청할 수 있습니다.
            </p>
        </div>
    );
};

export default Policy;