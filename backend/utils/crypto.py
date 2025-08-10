from cryptography.fernet import Fernet, InvalidToken
from typing import Optional
from .config import settings
import base64
import os


def _get_key() -> bytes:
    raw = getattr(settings, 'at_rest_encryption_key', None)
    if raw:
        try:
            return base64.urlsafe_b64encode(raw.encode('utf-8')[:32].ljust(32, b'0'))
        except Exception:
            pass
    # Fallback to a process-local random key if not configured
    key = os.environ.get('AT_REST_ENC_FALLBACK')
    if not key:
        key = base64.urlsafe_b64encode(os.urandom(32)).decode('utf-8')
        os.environ['AT_REST_ENC_FALLBACK'] = key
    return key.encode('utf-8')


def encrypt_text(plaintext: Optional[str]) -> Optional[str]:
    if plaintext is None:
        return None
    f = Fernet(_get_key())
    token = f.encrypt(plaintext.encode('utf-8'))
    return token.decode('utf-8')


def decrypt_text(ciphertext: Optional[str]) -> Optional[str]:
    if ciphertext is None:
        return None
    f = Fernet(_get_key())
    try:
        data = f.decrypt(ciphertext.encode('utf-8'))
        return data.decode('utf-8')
    except InvalidToken:
        return None


