#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the schema file relative to the script location
SCHEMA_FILE="$SCRIPT_DIR/../src/drizzle/schema.ts"

# Check if the file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "Error: Schema file not found at $SCHEMA_FILE"
    exit 1
fi

# Check if the imports already exist
if grep -q "import.*authUsers as users.*from 'drizzle-orm/supabase'" "$SCHEMA_FILE"; then
    echo "Auth users import already exists in schema.ts"
    exit 0
fi

# Create a temporary file
TMP_FILE=$(mktemp)

# Add the lines after all import statements
awk '
    BEGIN { printed_new_imports = 0; last_was_import = 0; buffer = "" }
    /^import.*from/ { 
        if (buffer != "") print buffer
        buffer = $0
        last_was_import = 1
        next
    }
    {
        if (last_was_import) {
            if ($0 ~ /^[[:space:]]*$/) {
                buffer = buffer "\n" $0
            } else {
                print buffer
                if (!printed_new_imports) {
                    print ""
                    print "import { authUsers as users } from '\''drizzle-orm/supabase'\'';"
                    print "export const usersInAuth = users;"
                    print ""
                    printed_new_imports = 1
                }
                buffer = ""
                print $0
                last_was_import = 0
            }
        } else {
            print $0
        }
    }
    END {
        if (buffer != "") {
            print buffer
            if (!printed_new_imports) {
                print ""
                print "import { authUsers as users } from '\''drizzle-orm/supabase'\'';"
                print "export const usersInAuth = users;"
                print ""
            }
        }
    }
' "$SCHEMA_FILE" > "$TMP_FILE"

# Replace the original file with the modified content
mv "$TMP_FILE" "$SCHEMA_FILE"

echo "🚀 Successfully added auth users import to schema.ts" 