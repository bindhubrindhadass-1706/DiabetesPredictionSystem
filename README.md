# Diabetes Prediction System

A full-stack diabetes risk screening app: Spring Boot REST API + a
vanilla HTML/CSS/JS single-page frontend ("Glycē").

## What was broken

The uploaded project only contained a partially-wired Spring Boot backend
(the `frontend`, `database`, `dataset`, and `documentation` folders were
empty) and it would **not compile**. Fixes made:

1. **Package/folder mismatch (fatal compile error).** `User.java`,
   `UserRepository.java`, `UserService.java`, and `UserController.java`
   declared package `com.brindha.diabetesprediction.*` but physically lived
   under `com/brindha/{entity,repository,service,controller}/` (missing the
   `diabetesprediction` segment). Java requires the two to match, so the
   project could not build. Moved every file to
   `com/brindha/diabetesprediction/...` to match its package declaration.

2. **Component scanning.** Because of (1), even if it had compiled, Spring
   Boot's `@SpringBootApplication` (in `com.brindha.diabetesprediction`)
   would never have found the entity/repository/service/controller beans,
   since they lived in a sibling package tree, not a sub-package. Fixed as
   part of the move above.

3. **Empty controller.** `UserController` had no endpoints at all (just a
   comment). Implemented `POST /api/users/register` and
   `POST /api/users/login` with request validation and JSON responses.

4. **Plaintext passwords.** `UserService` compared passwords with
   `.equals()`. Added BCrypt hashing (`spring-security-crypto`, added to
   `pom.xml`) so passwords are hashed at rest and never returned in API
   responses.

5. **No prediction feature at all**, despite being the app's namesake — no
   dataset or trained model shipped with the project. Added:
   - `PredictionRequest` / `PredictionRecord` / `PredictionRepository` /
     `PredictionService` / `PredictionController`
   - A transparent, documented rule-based risk scorer using the standard
     8 Pima-Indians-style clinical markers (glucose, BMI, age, blood
     pressure, insulin, pregnancies, skin thickness, pedigree function).
     It's intentionally easy to swap for a real trained model later — see
     the comment at the top of `PredictionService.java`.
   - `POST /api/predictions` and `GET /api/predictions/history/{email}`.

6. **Hardcoded DB credentials.** `application.properties` now reads
   `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` from the environment, falling
   back to the original local values so nothing breaks out of the box.

7. **Global error handling.** Added `GlobalExceptionHandler` so validation
   failures and unexpected errors return clean JSON instead of raw stack
   traces.

8. **Frontend built from scratch** (the folder was empty) — see below.

> I wasn't able to run an actual `mvn` build in this sandbox (no internet
> access to resolve Maven dependencies), so I couldn't get a green build
> log to show you. Every file was reviewed by hand for package/import
> consistency, but please run `./mvnw spring-boot:run` locally as a final
> check.

## Running the backend

```bash
cd backend/diabetesprediction

# Make sure a local MySQL server is running and reachable, then either:
#   a) edit src/main/resources/application.properties directly, or
#   b) export env vars before running:
export DB_URL="jdbc:mysql://localhost:3306/diabetes_db?createDatabaseIfNotExist=true"
export DB_USERNAME=root
export DB_PASSWORD=your_password

./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

| Endpoint | Method | Body |
|---|---|---|
| `/api/users/register` | POST | `{ name, email, password, age, gender, phone }` |
| `/api/users/login` | POST | `{ email, password }` |
| `/api/predictions` | POST | `{ userEmail, glucose, bloodPressure, bmi, age, insulin, skinThickness, pregnancies, diabetesPedigreeFunction }` |
| `/api/predictions/history/{email}` | GET | — |

## Running the frontend

No build step — it's plain HTML/CSS/JS.

```bash
cd frontend
python3 -m http.server 8123
# open http://localhost:8123
```

It calls the API at `http://localhost:8080/api` (see `API_BASE` in
`app.js` — change it if you deploy the backend elsewhere).

## The UI

A distinct "clinical test-strip / lab readout" visual identity, built to
avoid generic AI-template looks:

- **Palette:** deep chart-ink navy, pale mint "chart paper" background,
  teal test-strip accent, amber/coral for moderate/high risk.
- **Type:** Space Grotesk for headings, IBM Plex Mono for all numeric
  readouts (glucose, scores, dates), Inter for body copy.
- **Signature element:** a glucometer-style digital readout card with a
  segmented test-strip gauge and moving needle, reused for both the
  landing-page sample and the real result screen so the "instrument" feels
  consistent throughout the product.
- Fully responsive down to mobile; keyboard-focusable form fields; reduced
  motion respected via `prefers-reduced-motion`.
