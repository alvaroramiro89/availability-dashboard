# Data Structure and Persistence

## 🗂️ JSON Structure

The JSON stores **all availability data for year 2026** in a nested 3-level structure:

```json
{
  "2026-01-01": {
    "Alvaro": {
      "0-1": false,
      "1-2": false,
      "2-3": true,
      "3-4": true,
      ...
      "23-0": false
    },
    "Pablo": {
      "0-1": false,
      "1-2": true,
      ...
    },
    "Diego": { ... },
    "Bruno": { ... }
  },
  "2026-01-02": { ... },
  "2026-01-03": { ... },
  ...
  "2026-12-31": { ... }
}
```

### Structure Levels:

1. **Level 1: Date** (key: `"YYYY-MM-DD"`)

   - Example: `"2026-01-15"`
   - One entry for each day of year 2026 (366 days)

2. **Level 2: Team Member** (key: member name)

   - `"Alvaro"`, `"Pablo"`, `"Diego"`, `"Bruno"`
   - One entry for each team member

3. **Level 3: Time Slot** (key: hour range)
   - Example: `"0-1"`, `"5-6"`, `"23-0"`
   - 24 slots per day (0-23 hours)
   - Value: `true` (green/available) or `false` (red/not available)

### Complete Day Example:

```json
{
  "2026-01-15": {
    "Alvaro": {
      "0-1": false,
      "1-2": false,
      "2-3": false,
      "3-4": false,
      "4-5": false,
      "5-6": false,
      "6-7": false,
      "7-8": false,
      "8-9": false,
      "9-10": true,
      "10-11": true,
      "11-12": true,
      "12-13": true,
      "13-14": true,
      "14-15": true,
      "15-16": true,
      "16-17": true,
      "17-18": false,
      "18-19": false,
      "19-20": false,
      "20-21": false,
      "21-22": false,
      "22-23": false,
      "23-0": false
    },
    "Pablo": {
      "0-1": false,
      "1-2": false,
      ...
    },
    "Diego": { ... },
    "Bruno": { ... }
  }
}
```

### Estimated JSON Size:

- **366 days** × **4 members** × **24 slots** = **35,136 boolean values**
- Each value: `true` or `false` (5-6 characters with JSON formatting)
- **Approximate size**: ~500KB - 1MB (with indentation)

---

## 🔗 What is GitHub Gist?

**GitHub Gist** is a free GitHub service for sharing and storing code snippets or text files.

### Relevant Features for Our Project:

1. **Free and unlimited** (for reasonable use)
2. **Public REST API** for reading/writing
3. **Automatic versioning** (change history)
4. **Persistent storage** (doesn't get deleted)
5. **Token-based access** (authentication)

### A Gist is like a "file in the cloud":

```
Gist ID: abc123def456
  └── availability.json (our complete JSON file)
```

### GitHub Gist Limits:

- **Maximum file size**: 1MB (sufficient for our JSON)
- **Request limit**: 5,000 per hour (more than enough)
- **Cost**: 100% free

---

## 💾 How We Store JSON in Gist

### Current Flow (Production):

```
Frontend → Vercel Serverless Function → GitHub Gist API → Gist (cloud)
```

### Local Development Flow:

```
Frontend → Local Express Server → data-local.json (local file)
```

### Step-by-Step Process:

#### 1. **Reading (GET /api/availability)**

```typescript
// 1. Call GitHub Gist API
const gist = await octokit.gists.get({ gist_id: GIST_ID });

// 2. Extract JSON file content
const content = gist.data.files["availability.json"]?.content;

// 3. Parse JSON
const availabilityData = JSON.parse(content);

// 4. Initialize missing data (if first time)
// 5. Return to frontend
```

#### 2. **Writing (POST /api/availability-batch)**

```typescript
// 1. Read current Gist
const gist = await octokit.gists.get({ gist_id: GIST_ID });

// 2. Parse existing JSON
let availabilityData = JSON.parse(gist.data.files["availability.json"].content);

// 3. Apply batch changes
changes.forEach((change) => {
  availabilityData[change.date][change.member][change.slot] = change.available;
});

// 4. Update Gist with new JSON
await octokit.gists.update({
  gist_id: GIST_ID,
  files: {
    "availability.json": {
      content: JSON.stringify(availabilityData, null, 2),
    },
  },
});
```

### Minimum Data Unit:

**✅ YES, the complete JSON is the minimum unit**

- **We don't save individual changes** (not efficient)
- **We save the complete JSON** every time there are changes
- **GitHub Gist handles versioning** automatically

### Why Save the Complete JSON?

1. **Simplicity**: Single file, easy to read/write
2. **Consistency**: We always have the complete state
3. **Versioning**: Gist automatically saves history
4. **Manageable Size**: ~1MB is small for modern APIs

### Alternative (More Complex):

If the JSON grew too large, we could:

- Split by months (12 files)
- Split by members (4 files)
- Use a real database

**But for our case (4 people, 1 year): the complete JSON is perfect.**

---

## 🔐 Gist Authentication

### GitHub Token:

1. Create a **Personal Access Token** on GitHub
2. Required permissions: `gist` (create/edit gists)
3. Save as environment variable: `GITHUB_TOKEN`

### Gist ID:

1. Create an initial Gist (manually or automatically)
2. Save the Gist ID
3. Save as environment variable: `GIST_ID`

### Environment Variables in Vercel:

```
GITHUB_TOKEN = ghp_xxxxxxxxxxxxx
GIST_ID = abc123def456789
```

### Environment Variables for Local Development:

Create `.env.local` file:

```
GITHUB_TOKEN = ghp_xxxxxxxxxxxxx
GIST_ID = abc123def456789
```

---

## 📈 Advantages of Using Gist vs Database

| Aspect         | Gist         | Database                 |
| -------------- | ------------ | ------------------------ |
| **Cost**       | ✅ Free      | ❌ May cost              |
| **Setup**      | ✅ 2 minutes | ❌ Complex configuration |
| **Limits**     | ✅ 1MB/file  | ✅ Unlimited             |
| **Versioning** | ✅ Automatic | ❌ Manual                |
| **Backup**     | ✅ Automatic | ❌ Manual                |
| **For MVP**    | ✅ Perfect   | ⚠️ Overkill              |

---

## 🔄 Gist Revisions

### How Revisions Work:

- **Each `gists.update()` call creates a new revision**
- **GET requests don't create revisions** (only if initialization occurs)
- **POST requests create revisions** when data is actually updated
- **GitHub Gist automatically maintains revision history**

### Revision History:

- Accessible via GitHub Gist web interface
- Shows all changes over time
- Can view diffs between revisions
- Can restore previous versions (manually)

### Revision Considerations:

- **Advantage**: Complete change history
- **Consideration**: Many updates = many revisions
- **Current behavior**: Only creates revisions when data changes

---

## 🎯 Summary

1. **JSON**: Nested structure `date → member → slot → boolean`
2. **Gist**: Free GitHub service for storing files in the cloud
3. **Minimum Unit**: Complete JSON (not individual changes)
4. **Advantage**: Simple, free, automatic versioning
5. **Perfect for**: MVP with 4 people, 1 year of data
6. **Revisions**: Each update creates a new Gist revision (automatic history)

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │
       │ GET /api/availability
       │ POST /api/availability-batch
       ▼
┌─────────────────────┐
│ Vercel Serverless   │
│ Function            │
└──────┬──────────────┘
       │
       │ @octokit/rest
       ▼
┌─────────────────────┐
│  GitHub Gist API    │
└──────┬──────────────┘
       │
       │ Read/Write
       ▼
┌─────────────────────┐
│  GitHub Gist        │
│  availability.json  │
│  (Cloud Storage)    │
└─────────────────────┘
```

---

## 🔧 Technical Details

### Gist API Operations:

1. **Read**: `octokit.gists.get({ gist_id })`

   - Returns Gist metadata and file contents
   - File content is base64 encoded (automatically decoded by Octokit)

2. **Update**: `octokit.gists.update({ gist_id, files })`
   - Updates entire Gist
   - Creates new revision
   - Returns updated Gist data

### Error Handling:

- **Missing Gist**: Returns empty object, initializes on first write
- **Invalid Token**: Returns 401 Unauthorized
- **Rate Limit**: GitHub API rate limits apply (5,000 requests/hour)
- **Network Errors**: Retry logic can be added

### Performance Considerations:

- **Read Time**: ~200-500ms (network + processing)
- **Write Time**: ~300-800ms (read + update + write)
- **Concurrency**: Multiple simultaneous updates may cause conflicts
- **Optimization**: Batch updates reduce API calls
