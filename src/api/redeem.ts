import request from '@/utils/request/req';

// 凭码兑换
export function redeemCode(params: { code: string; userId: string | number }) {
	return request({
		url: '/redeem/code/redeem',
		method: 'post',
		data: params
	  });
}




