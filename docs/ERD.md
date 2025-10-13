## Dashtia - ERD (generated from `stats/models.py`)

This file contains a Mermaid ER diagram representing the Django models found in `stats/models.py`.

```mermaid
erDiagram
    USER {
        int id PK
        string username
        string email
    }

    TEAM {
        int id PK
        string name
        string slug
        text description
        datetime created_at
        boolean is_private
    }

    TEAM_MEMBERSHIP {
        int id PK
        string role
        datetime joined_at
    }

    STATISTIC {
        int id PK
        string name
        string slug
        string unit_type
        string custom_unit
        decimal min_value
        decimal max_value
        string chart_type
        datetime created_at
        string visibility
        boolean is_active
    }

    DATA_ITEM {
        int id PK
        decimal value
        string owner
        datetime timestamp
    }

    KPI_DELETION {
        int id PK
        datetime deleted_at
        text reason
    }

    %% Relationships
    TEAM ||--o{ TEAM_MEMBERSHIP : "has"
    USER ||--o{ TEAM_MEMBERSHIP : "is_member"

    USER ||--o{ TEAM : "created_by"

    USER ||--o{ STATISTIC : "owner_of"
    STATISTIC }o--o{ TEAM : "visible_to (m2m)"

    STATISTIC ||--o{ DATA_ITEM : "has"
    STATISTIC ||--o{ KPI_DELETION : "has_deletion_records"

    USER ||--o{ KPI_DELETION : "deleted_by"

    %% Notes
    %% - TeamMembership has unique_together(team, user)
    %% - KPI_DELETION.deleted_by uses SET_NULL (nullable)

```

Notes
- Diagram generated from `stats/models.py` (Team, TeamMembership, Statistic, DataItem, KpiDeletion).
- The `User` entity represents `django.contrib.auth.models.User` referenced by multiple FKs.
- Field types are mapped to generic types for readability (e.g. DecimalField -> decimal).

If you'd like the ERD to include additional apps/models (or want attribute-level cardinalities changed), tell me what to add and I'll update the diagram.
