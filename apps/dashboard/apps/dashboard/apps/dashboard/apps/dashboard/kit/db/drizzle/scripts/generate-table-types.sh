#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the TypeScript script that generates table types
TS_SCRIPT="$SCRIPT_DIR/generate-table-types.ts"

# Check if the TypeScript script exists
if [ ! -f "$TS_SCRIPT" ]; then
    echo "Error: TypeScript script not found at $TS_SCRIPT"
    exit 1
fi

# Run the TypeScript script with ts-node
# This allows us to run the TypeScript script without compiling it first
npx tsx "$TS_SCRIPT"

# Exit with the status of the TypeScript script
exit $? 