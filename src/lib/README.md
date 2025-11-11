# Data Access Layer

This directory contains the Supabase data access logic for the application.

## Structure

```
src/lib/
├── supabase/
│   ├── client.ts      # Supabase client initialization
│   └── types.ts       # TypeScript types for database schema
└── api/
    ├── types.ts       # Application-level types
    └── teams.ts       # Team CRUD operations

src/hooks/
└── useTeams.ts        # React hooks for team data
```

## Usage

### Supabase Client

```typescript
import { supabase } from '@/lib/supabase/client';

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### API Functions

```typescript
import * as teamsApi from '@/lib/api/teams';

// Create team
const { data, error } = await teamsApi.createTeam('Team Name', 'Hospital Name');

// Get my teams
const { data, error } = await teamsApi.getMyTeams();

// Get team by ID
const { data, error } = await teamsApi.getTeam(teamId);

// Join team
const { data, error } = await teamsApi.joinTeam('INVITE');

// Update team
const { data, error } = await teamsApi.updateTeam(teamId, { name: 'New Name' });

// Delete team
const { data, error } = await teamsApi.deleteTeam(teamId);
```

### React Hooks

```typescript
import { useMyTeams, useTeam } from '@/hooks/useTeams';

function MyComponent() {
  const { teams, loading, error, refetch } = useMyTeams();
  const { team, loading: teamLoading, error: teamError } = useTeam(teamId);
  
  // Use data...
}
```

## Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Notes

- All functions return `ApiResponse<T>` with `{ data: T | null, error: string | null }`
- RLS (Row Level Security) is enforced at the database level
- No manual permission checks in frontend code
- All database queries use `supabase.from("TABLE")` syntax

