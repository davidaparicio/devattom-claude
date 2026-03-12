---
name: hexagonal-architecture
description: Hexagonal Architecture (Ports & Adapters) and Domain-Driven Design principles. ALWAYS activate when creating domain entities, use cases, repository interfaces, application services, infrastructure adapters, or when the project CLAUDE.md specifies hexagonal/DDD architecture. Use when the user mentions "domain", "use case", "port", "adapter", "repository interface", "application service", "domain entity", "value object", "aggregate", "bounded context", "DDD", "hexagonal", "clean architecture", "archi hexagonale".
---

# Hexagonal Architecture (Ports & Adapters) + DDD

## Core Principle

> The domain is the heart of the application. It knows nothing about databases, frameworks, HTTP, or any infrastructure concern. All external systems talk to the domain through **ports** (interfaces). **Adapters** implement those ports.

---

## Layer Model

```
┌─────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                    │  ← Frameworks, DB, HTTP, queues, external APIs
│  ┌──────────────────────────────────────────────┐   │
│  │               APPLICATION                    │   │  ← Use cases, orchestration, DTOs
│  │  ┌────────────────────────────────────────┐  │   │
│  │  │              DOMAIN                    │  │   │  ← Entities, value objects, domain services
│  │  │   Pure business logic — no imports     │  │   │     aggregates, domain events, repo interfaces
│  │  └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Dependency Rule
Arrows point **inward only**. Infrastructure depends on Application which depends on Domain. Domain depends on nothing.

---

## Domain Layer

### Entities
Objects with identity that persists over time. Identity is what matters, not attributes.

```php
// Good — plain PHP, no framework imports
final class Lesson
{
    private LessonId $id;
    private LearnerId $learnerId;
    private LessonStatus $status;
    private CourseContent $content;

    public function __construct(
        LessonId $id,
        LearnerId $learnerId,
        Subject $subject,
    ) {
        $this->id = $id;
        $this->learnerId = $learnerId;
        $this->status = LessonStatus::Pending;
        $this->content = CourseContent::empty();
    }

    /** @throws LessonAlreadyClosedException */
    public function close(): void
    {
        if ($this->status->isClosed()) {
            throw new LessonAlreadyClosedException($this->id);
        }
        $this->status = LessonStatus::Closed;
        $this->recordEvent(new LessonClosed($this->id));
    }

    public function id(): LessonId { return $this->id; }
    public function status(): LessonStatus { return $this->status; }
}
```

### Value Objects
Immutable, no identity — equality is defined by value, not by reference.

```php
final class LessonId
{
    public function __construct(private readonly string $value)
    {
        if (empty($value)) {
            throw new \InvalidArgumentException('LessonId cannot be empty');
        }
    }

    public static function generate(): self
    {
        return new self((string) \Ramsey\Uuid\Uuid::uuid4());
    }

    public static function from(string $value): self
    {
        return new self($value);
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function toString(): string { return $this->value; }
    public function __toString(): string { return $this->value; }
}
```

### Domain Enums / Status
```php
enum LessonStatus
{
    case Pending;
    case Generating;
    case Active;
    case Closed;

    public function isClosed(): bool
    {
        return $this === self::Closed;
    }

    public function canReceiveMessages(): bool
    {
        return $this === self::Active;
    }
}
```

### Repository Interfaces (Ports)
The domain defines **what** it needs — never **how** it is stored.

```php
interface LessonRepository
{
    public function findById(LessonId $id): ?Lesson;

    /** @throws LessonNotFoundException */
    public function getById(LessonId $id): Lesson;

    /** @return Lesson[] */
    public function findByLearner(LearnerId $learnerId): array;

    public function save(Lesson $lesson): void;

    public function delete(LessonId $id): void;
}
```

### Domain Services
Stateless logic that does not naturally belong to a single entity.

```php
final class CreditAllocationService
{
    /** @throws InsufficientCreditsException */
    public function ensureSufficientCredits(CreditBalance $balance, int $required): void
    {
        if ($balance->isLessThan($required)) {
            throw new InsufficientCreditsException($balance, $required);
        }
    }
}
```

### Domain Events
Signal that something meaningful happened in the domain.

```php
final class LessonClosed
{
    public function __construct(
        public readonly LessonId $lessonId,
        public readonly \DateTimeImmutable $occurredAt = new \DateTimeImmutable(),
    ) {}
}
```

---

## Application Layer

### Use Cases (Application Services)
Orchestrate domain objects to fulfill a single business scenario. Receive ports as dependencies (injected via constructor). Return DTOs or primitive values — never domain entities to infrastructure callers.

```php
final class CloseLesson
{
    public function __construct(
        private readonly LessonRepository $lessons,
        private readonly EventDispatcher $events,
    ) {}

    /** @throws LessonNotFoundException */
    /** @throws LessonAlreadyClosedException */
    public function execute(CloseLessonCommand $command): void
    {
        $lesson = $this->lessons->getById(
            LessonId::from($command->lessonId)
        );

        $lesson->close();

        $this->lessons->save($lesson);
        $this->events->dispatch(...$lesson->pullDomainEvents());
    }
}
```

### Commands and Queries (CQRS optional)
DTOs that carry input data to use cases.

```php
// Command — intent to change state
final class CloseLessonCommand
{
    public function __construct(
        public readonly string $lessonId,
        public readonly string $requestedByUserId,
    ) {}
}

// Query — intent to read state
final class GetLessonDetailsQuery
{
    public function __construct(
        public readonly string $lessonId,
    ) {}
}
```

### Ports for External Services
Interfaces for everything outside the domain (email, IA, payment…).

```php
interface CourseGenerationService
{
    /** @throws CourseGenerationFailedException */
    public function generateAsync(GenerateCourseRequest $request): GenerationJobId;
}

interface CreditGateway
{
    public function getBalance(LearnerId $learnerId): CreditBalance;
    public function deduct(LearnerId $learnerId, int $amount, string $reason): void;
}
```

---

## Infrastructure Layer

### Repository Adapters
Implement domain repository interfaces using the ORM/database of choice.

```php
// Implements the domain port — lives in Infrastructure, not Domain
final class EloquentLessonRepository implements LessonRepository
{
    public function findById(LessonId $id): ?Lesson
    {
        $model = LessonModel::query()->find($id->toString());

        return $model ? $this->toDomain($model) : null;
    }

    public function getById(LessonId $id): Lesson
    {
        return $this->findById($id)
            ?? throw new LessonNotFoundException($id);
    }

    public function save(Lesson $lesson): void
    {
        LessonModel::query()->updateOrCreate(
            ['id' => $lesson->id()->toString()],
            $this->toModel($lesson),
        );
    }

    private function toDomain(LessonModel $model): Lesson
    {
        // Map ORM model → domain entity
        return Lesson::reconstitute(
            LessonId::from($model->id),
            LearnerId::from($model->learner_id),
            LessonStatus::from($model->status),
        );
    }

    /** @return array<string, mixed> */
    private function toModel(Lesson $lesson): array
    {
        return [
            'learner_id' => $lesson->learnerId()->toString(),
            'status' => $lesson->status()->name,
        ];
    }
}
```

### Controllers (HTTP Adapters)
Thin. Validate input → call use case → return response. **Zero business logic.**

```php
final class CloseLessonController
{
    public function __construct(private readonly CloseLesson $closeLesson) {}

    public function __invoke(CloseLessonRequest $request, string $lessonId): JsonResponse
    {
        $this->closeLesson->execute(new CloseLessonCommand(
            lessonId: $lessonId,
            requestedByUserId: $request->user()->id,
        ));

        return response()->json(status: 204);
    }
}
```

### External Service Adapters
Implement application ports for third-party APIs.

```php
final class HttpCourseGenerationService implements CourseGenerationService
{
    public function __construct(private readonly BloomIaClient $client) {}

    public function generateAsync(GenerateCourseRequest $request): GenerationJobId
    {
        $response = $this->client->post('/generate/course', [
            'learner_id' => $request->learnerId->toString(),
            'subject' => $request->subject->value,
        ]);

        return GenerationJobId::from($response['job_id']);
    }
}
```

---

## Directory Structure

```
app/
├── Domain/
│   ├── Lesson/
│   │   ├── Lesson.php                    # Entity
│   │   ├── LessonId.php                  # Value Object
│   │   ├── LessonStatus.php              # Enum
│   │   ├── LessonRepository.php          # Port (interface)
│   │   ├── LessonNotFoundException.php   # Domain exception
│   │   └── Events/
│   │       └── LessonClosed.php          # Domain event
│   └── Credit/
│       ├── CreditBalance.php
│       ├── CreditGateway.php             # Port
│       └── InsufficientCreditsException.php
│
├── Application/
│   ├── UseCases/
│   │   └── CloseLesson/
│   │       ├── CloseLesson.php           # Use case
│   │       └── CloseLessonCommand.php    # Input DTO
│   └── Ports/
│       └── CourseGenerationService.php   # Port for external IA
│
└── Infrastructure/
    ├── Persistence/
    │   ├── Models/
    │   │   └── LessonModel.php           # ORM model (not a domain entity)
    │   └── Repositories/
    │       └── EloquentLessonRepository.php
    ├── Http/
    │   ├── Controllers/
    │   │   └── CloseLessonController.php
    │   └── Requests/
    │       └── CloseLessonRequest.php
    ├── Queue/
    │   └── Jobs/
    │       └── GenerateCourseJob.php
    └── External/
        └── BloomIa/
            └── HttpCourseGenerationService.php
```

---

## Key Rules — Checklist

### Domain
- [ ] No framework imports (`use Illuminate\...`, `use Symfony\...`, etc.)
- [ ] No constructor dependency on infrastructure services
- [ ] Entities have private/protected state — expose behavior, not data
- [ ] Value objects are `final` and immutable (`readonly` where possible)
- [ ] Repository contracts defined here as interfaces, not implementations
- [ ] Domain exceptions extend a base domain exception, not HTTP exceptions

### Application
- [ ] Use cases receive ports (interfaces) via constructor injection
- [ ] Use cases return DTOs or void — never raw ORM models
- [ ] No HTTP/framework objects in use cases (`Request`, `Response`…)
- [ ] One use case = one public method (`execute()`)
- [ ] Business invariants enforced before saving

### Infrastructure
- [ ] Repositories implement domain interfaces, live in Infrastructure
- [ ] ORM models are internal to the persistence adapter — never exposed to Domain
- [ ] Mapping domain ↔ persistence is explicit (no auto-serialization of domain objects)
- [ ] Controllers are thin: no `if` branches, no domain logic
- [ ] Dependency Injection container binds interfaces → concrete adapters

### General
- [ ] No circular dependencies between layers
- [ ] Framework-specific code never bleeds into Domain or Application
- [ ] Domain objects are unit-testable without booting the framework

---

## Dependency Injection Binding Example

```php
// Service Provider — Infrastructure binding
$this->app->bind(LessonRepository::class, EloquentLessonRepository::class);
$this->app->bind(CourseGenerationService::class, HttpCourseGenerationService::class);
```

---

## Anti-Patterns to Avoid

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| Domain entity extends ORM model | Couples domain to persistence | Separate domain entity from ORM model, add mapper |
| Controller with business logic | Bypass use case | Extract to use case, controller calls it |
| Use case using `DB::` or ORM directly | Bypasses repository port | Inject repository interface, use domain model |
| Repository returns ORM model | Leaks persistence to application | Map to domain entity before returning |
| Domain imports framework class | Couples domain to framework | Define a port interface in Domain, implement in Infrastructure |
| Fat domain entity with HTTP context | Domain knows about HTTP | Pass DTOs or primitives, not `Request` objects |
| God use case doing 10 things | Violates SRP | Split into multiple focused use cases |
