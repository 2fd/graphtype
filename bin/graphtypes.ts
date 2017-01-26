import {schemaToDefinition} from '../lib/typescript';
const schema = require('../test/github.json');


console.log(
    schemaToDefinition(schema.data.__schema)
);
