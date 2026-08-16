import authApi from "./authApi";
import {
  setAccessToken,
  clearAccessToken,
} from "./tokenStore";


let refreshPromise = null;


export function refreshAccessTokenRequest() {
  if (refreshPromise) {
    return refreshPromise;
  }


  refreshPromise = authApi
    .get("/auth/refresh-token", {
      skipGlobalError: true,
    })
    .then((response) => {
      console.log(
        "Refresh response:",
        response.data
      );

      const newAccessToken =
        response.data?.accessToken;

      if (!newAccessToken) {
        throw new Error(
          "Backend did not return response.data.accessToken"
        );
      }

      setAccessToken(newAccessToken);

      return newAccessToken;
    })
    .catch((error) => {
      clearAccessToken();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });


  return refreshPromise;
}