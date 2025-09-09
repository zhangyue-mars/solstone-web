export interface LoginFrom {
	username: string // 用户名
	password: string // 用户密码
	type: string // 登录类型
}

export interface LoginUserInfo {
	userId: string | number; // 用户id
	nickName: string; // 用户昵称
	avatar: string; // 用户头像
	userBalance: number; // 账户余额
	userName: string; // 用户名（邮箱）
	userGrade?: string; // 用户等级
	createTime?: string; // 创建时间
	roleName?: string; // 角色名
}

export interface UserData {
	token: string; // 登录token
	user: LoginUserInfo; // 用户信息
}