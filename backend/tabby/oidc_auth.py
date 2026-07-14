import json

from jose import jwk
from jose.exceptions import JWKError
from jose.utils import base64url_decode

from social_core.backends.open_id_connect import OpenIdConnectAuth


class OIDCAuth(OpenIdConnectAuth):
    name = "oidc"

    @property
    def OIDC_ENDPOINT(self):
        return self.setting("OIDC_ENDPOINT")

    def find_valid_key(self, id_token):
        header_b64 = id_token.split(".")[0]
        try:
            kid = json.loads(
                base64url_decode(header_b64.encode()).decode()
            ).get("kid")
        except Exception:
            kid = None

        for key in self.get_jwks_keys():
            if key.get("use") not in (None, "sig"):
                continue
            if kid is not None and key.get("kid") != kid:
                continue
            try:
                rsakey = jwk.construct(key)
                msg, sig_b64 = id_token.rsplit(".", 1)
                sig = base64url_decode(sig_b64.encode())
                if rsakey.verify(msg.encode(), sig):
                    return key
            except (JWKError, TypeError):
                continue
        return None
