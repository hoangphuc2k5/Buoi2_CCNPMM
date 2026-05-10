# Buoi2_CCNPMM

API register su dung Express.js, MySQL va kien truc 3 tang.

Mac dinh project chay o cong `8081`.

## Cac API

`POST /api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

`POST /api/auth/verify-register-otp`

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

## Bao mat da ap dung

- Validation email, password, confirmPassword va OTP.
- Ma hoa password bang `bcrypt`.
- Rate limiting theo email va IP: toi da 3 lan trong 10 phut.
- OTP co hieu luc trong 5 phut.
- Tai khoan chi duoc kich hoat khi OTP hop le.

## Bien moi truong mail

- `PORT`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
