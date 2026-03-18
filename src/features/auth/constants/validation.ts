// 비밀번호: 영어, 숫자, 특수문자 포함 필수, 8-20자
export const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export const PASSWORD_CONSTRAINTS = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 20,
    MESSAGE: "비밀번호는 영어, 숫자, 특수문자를 포함해야 합니다.",
    LENGTH_MESSAGE: "비밀번호는 8자 이상 20자 이하로 입력해주세요.",
};

// 닉네임: 한글, 영문, 숫자만 가능, 2-20자
export const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣]{2,20}$/;

export const NICKNAME_CONSTRAINTS = {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    MESSAGE: "닉네임은 특수문자를 제외한 한글, 영문, 숫자만 가능합니다.",
};
