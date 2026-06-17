# Update Job Failed Node - Kopierbare Werte

## Table Name
```
reading_jobs
```

## Select Condition

**Field Name or ID:**
```
id
```

**Condition:**
```
Equals
```

**Field Value:**
```
={{ $json.readingId }}
```

## Fields to Send

### Feld 1: status
**Field Name or ID:**
```
status
```

**Field Value:**
```
failed
```

### Feld 2: error
**Field Name or ID:**
```
error
```

**Field Value:**
```
={{ $json.error || $json.message }}
```

### Feld 3: updated_at
**Field Name or ID:**
```
updated_at
```

**Field Value:**
```
={{ $now.toISO() }}
```

---

## Schnell-Checkliste

1. Table Name or ID: `reading_jobs`
2. Add Condition:
   - Column: `id`
   - Operator: `Equals`
   - Value: `={{ $json.readingId }}`
3. Add Field 1:
   - Column: `status`
   - Value: `failed`
4. Add Field 2:
   - Column: `error`
   - Value: `={{ $json.error || $json.message }}`
5. Add Field 3:
   - Column: `updated_at`
   - Value: `={{ $now.toISO() }}`
6. Save klicken
