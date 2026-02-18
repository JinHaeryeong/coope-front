const Terms = () => {
    return (
        <div className="h-80 overflow-y-auto bg-muted/30 p-4 rounded-md text-sm leading-relaxed text-muted-foreground">
            <h3 className="font-bold text-foreground mb-2">제 1 조 (목적)</h3>
            <p className="mb-4">
                이 약관은 <strong>Coope</strong>(이하 "서비스")가 제공하는 인터넷 관련 서비스의 이용조건 및 절차, 이용자와 서비스의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.
            </p>

            <h3 className="font-bold text-foreground mb-2">제 2 조 (정의)</h3>
            <p className="mb-4">
                1. "이용자"란 서비스에 접속하여 이 약관에 따라 서비스를 받는 회원 및 비회원을 말합니다.<br />
                2. "회원"이라 함은 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 이용할 수 있는 자를 말합니다.
            </p>

            <h3 className="font-bold text-foreground mb-2">제 3 조 (약관의 명시와 개정)</h3>
            <p className="mb-4">
                1. 본 서비스는 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.<br />
                2. 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 서비스 내에 공지합니다.
            </p>

            <h3 className="font-bold text-foreground mb-2">제 4 조 (서비스의 제공 및 변경)</h3>
            <p className="mb-4">
                1. 본 서비스는 이용자에게 웹 기반 플랫폼 서비스를 제공합니다.<br />
                2. 기술적 사양의 변경이나 운영상의 사유로 서비스 내용을 변경할 수 있으며, 이 경우 서비스 화면에 즉시 게시합니다.
            </p>

            <h3 className="font-bold text-foreground mb-2">제 5 조 (서비스의 중단)</h3>
            <p className="mb-4">
                1. 서비스는 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스 제공을 일시적으로 중단할 수 있습니다.
            </p>

            <h3 className="font-bold text-foreground mb-2">제 6 조 (이용자의 의무)</h3>
            <p>
                이용자는 다음 행위를 하여서는 안 됩니다.<br />
                - 신청 또는 변경 시 허위 내용의 등록<br />
                - 타인의 정보 도용<br />
                - 서비스에 게시된 정보의 변경<br />
                - 서비스가 금지한 정보의 송신 또는 게시
            </p>
        </div>
    );
};

export default Terms;