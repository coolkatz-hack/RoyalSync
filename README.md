# RoyalSync
An intelligent, straight-through client management and claims orchestration platform designed to eliminate compliance paperwork and connect clients, advisers, and South Africa's top insurers in real time.

## Admin dashboard

The Next.js app follows the `InsuranceHubAdmin` Lambda contract:

- `GET /admin` lists customers for `admin` and `helper` roles.
- `GET /admin?customerId=...` loads a profile, policies, and claims.
- `POST /admin` registers a customer for the `helper` role only.

Create `.env.local` from `.env.example`, then run:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

The browser sends `X-User-Role` to API Gateway. The role selector is a development control; production authentication should establish the role in API Gateway or a trusted authorizer rather than trusting a client-selected role.

The registration form sends these additional nested fields in the `POST /admin` body:

```json
{
	"vehicle": { "registration": "CA123456", "make": "Toyota", "model": "Corolla Cross", "year": "2023" },
	"insurer": { "name": "Sanlam", "policyNumber": "SAN-POL-9921", "coverage": "Comprehensive Motor" },
	"adviser": { "name": "Royal Claims", "phone": "+27115550100", "email": "support@royalclaims.co.za", "fspNumber": "FSP-48102" }
}
```

Update the deployed Lambda's POST destructuring and profile item before redeploying, otherwise the existing function will ignore `insurer` and `adviser`:

```js
const { fullName, email, phone, idNumber, address, taxNumber, vehicle, insurer, adviser } = body;
// ...inside newCustomer
address: address || "",
taxNumber: taxNumber || "",
vehicle: vehicle || {},
insurer: insurer || {},
adviser: adviser || {},
```
