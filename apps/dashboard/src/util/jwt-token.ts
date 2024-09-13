export const tokenExpired = (token: string) => {
	if (!token) {
		return {
			expired: true,
		};
	}

	const exp = decodeToken(token).exp;
	return {
		expired: calculateExpired(exp),
		exp,
	};
};

export const decodeToken = (token: string) =>
	JSON.parse(atob(token.split('.')[1]));

export const calculateExpired = (exp: number) =>
	Math.floor(Date.now() / 1000) >= exp;
