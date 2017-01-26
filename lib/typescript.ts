import { EOL } from 'os';
import { format } from 'util';
import * as wrap from 'word-wrap';
import { AsDefault, Deprecation, Description, EnumValue, Field, InputValue, Schema, SchemaType, TypeRef } from './interface';
import { ENUM, INPUT_OBJECT, INTERFACE, LIST, NON_NULL, OBJECT, SCALAR, UNION } from './introspection';

/**
 * Utility
 */
const TAB = '    ';

function beginComment(tab: string): string {
    return tab + '/**';
}

function toComment(comment: string, tab: string): string {
    return wrap(comment, {
        width: 80,
        indent: tab + ' * '
    });
};

function endComment(tab: string): string {
    return tab + ' */';
}

/**
 * utilDefinition
 */
function utilDefinition() {
    return [
        'type NonNull<T> = T;',
        'type List<T> = T[];',
        'type Optional<T> = T | null;',
    ].join(EOL);
}

/**
 * refToDefinition
 * Translate GraphQL values to equivalent Typescript type:
 * @example (T) => Optional<T>;
 * @example (T!) => NonNull<T>;
 * @example ([T]!) => NonNull<List<Optional<T>>>>;
 * @example ([T!]) => Optional<List<NonNull<T>>>>;
 * @example ([T!]!) => NonNull<List<NonNull<T>>>>;
 */
function refToDefinition(type: TypeRef, isNonNull: boolean = false) {
    switch (type.kind) {
        case LIST:
            return format('List<%s>', refToDefinition(type.ofType, false));

        case NON_NULL:
            return format('NonNull<%s>', refToDefinition(type.ofType, true));

        default:
            return isNonNull ? type.name : format('Optional<%s>', type.name);
    }
}

/**
 * Generate documentation
 */
function descriptionToComment(desc: Description | Deprecation | AsDefault, tab: string = ''): string {

    if (
        (desc as AsDefault).defaultValue ||
        (desc as Description).description ||
        (desc as Deprecation).isDeprecated
    ) {
        let def = [];

        if ((desc as Deprecation).isDeprecated) {

            let deprecated = '@deprecated';

            if ((desc as Deprecation).deprecationReason)
                deprecated += ' ' + (desc as Deprecation).deprecationReason;

            def.push(toComment(deprecated, tab));
        }

        if ((desc as AsDefault).defaultValue) {
            if (def.length > 0)
                def.push(toComment('', tab));
            def.push(toComment('@default ' + (desc as AsDefault).defaultValue, tab));
        }

        if ((desc as Description).description) {
            if (def.length > 0)
                def.push(toComment('', tab));
            def.push(toComment((desc as Description).description, tab));
        }

        def.unshift(beginComment(tab));
        def.push(endComment(tab));

        return def.join('\n');
    }

    return '';
}



/**
 * Graphql scalar to Typescript primitive
 */
function scalarToDefinition(type: TypeRef, typescriptAlias: string = 'string'): string {
    let def = [];

    if (type.description)
        def.push(descriptionToComment(type));

    def.push(format('type %s = %s;', type.name, typescriptAlias));

    return def.join(EOL);
}

/**
 * Field
 */
export function fieldToDefinition(field: Field): string {
    let def = [
        ''
    ];

    if (field.description || field.isDeprecated) {
        def.push(descriptionToComment(field, TAB));
    }

    def.push(TAB + field.name + ': ' + refToDefinition(field.type) + ';');

    return def.join(EOL);
}

/**
 * List of Fields
 */
export function fieldsToDefinition(fields: Field[]): string {

    return fields.map(field => fieldToDefinition(field)).join(EOL);
}

/**
 * Graphql type to Typescript interface;
 */
export function typeToDefinition(type: SchemaType): string {

    const impl = type.interfaces.length > 0 ?
        ' extends ' + type.interfaces.map(inter => inter.name).join(', ') : '';

    const def = [];

    if (type.description)
        def.push(descriptionToComment(type));

    def.push(format('export interface %s%s {', type.name, impl));
    def.push(fieldsToDefinition(type.fields));
    def.push('}');

    return def.join(EOL);
}

/**
 * Graphql interface to Typescript interface;
 */
export function interfaceToDefinition(type: SchemaType): string {

    const def = [];

    if (type.description)
        def.push(descriptionToComment(type));

    def.push(format('export interface %s {', type.name));
    def.push(fieldsToDefinition(type.fields));
    def.push('}');

    return def.join(EOL);
}

/**
 * Input value
 */
export function inputValueToDefinition(arg: InputValue): string {

    let def = [''];

    if (arg.description)
        def.push(descriptionToComment(arg, TAB));

    def.push(TAB + arg.name + ': ' + refToDefinition(arg.type) + ';');

    return def.join(EOL);
}

/**
 * List of Input values
 */
export function inputValuesToDefinition(args: InputValue[]): string {

    return args.map(arg => inputValueToDefinition(arg)).join(EOL);
}

/**
 * GraphQL input to Typescript interface
 */
export function inputToDefinition(type: SchemaType): string {

    const def = [];

    if (type.description)
        def.push(descriptionToComment(type));

    def.push(format('export interface %s {', type.name));
    def.push(inputValuesToDefinition(type.inputFields));
    def.push('}');

    return def.join(EOL);
}

/**
 * GraphQL union to Typescript type
 */
export function unionToDefinition(type: SchemaType): string {

    return format(
        'export type %s = %s;',
        type.name,
        type.possibleTypes.map((possibleType) => possibleType.name).join(' | ')
    );
}

/**
 * Enum value
 */
export function enumValueToDefinition(value: EnumValue): string {

    let def = [''];

    if (value.description)
        def.push(descriptionToComment(value, TAB));

    def.push(TAB + '"' + value.name + '"');

    return def.join(EOL);
}

/**
 * List of Enum values
 */
export function enumValuesToDefinition(vals: EnumValue[]): string {

    return vals.map(val => enumValueToDefinition(val)).join(' |' + EOL);
}

/**
 * GraphQL enum to Typescript type
 */
export function enumToDefinition(type: SchemaType): string {

    let def = [];

    if (type.description)
        def.push(descriptionToComment(type));

    def.push(format('export type %s = (', type.name));
    def.push(enumValuesToDefinition(type.enumValues));
    def.push(');');

    return def.join(EOL);
}


/**
 * GraphQL schema to Typescript definition
 */
export function schemaToDefinition(schema: Schema, scalarAlias: { [name: string]: string } = {}): string {

    scalarAlias = Object.assign({}, scalarAlias, {
        Boolean: 'boolean',
        Int: 'number',
        Float: 'number',
        String: 'string',
    });

    let def = [];
    let schemaDef = [];
    schemaDef.push('export interface Schema {');

    if (schema.queryType) {
        schemaDef.push('');
        schemaDef.push(descriptionToComment(schema.queryType));
        schemaDef.push(TAB + 'query: ' + schema.queryType.name);
    }

    if (schema.mutationType) {
        schemaDef.push('');
        schemaDef.push(descriptionToComment(schema.mutationType));
        schemaDef.push(TAB + 'mutation: ' + schema.mutationType.name);
    }

    if (schema.subscriptionType) {
        schemaDef.push('');
        schemaDef.push(descriptionToComment(schema.subscriptionType));
        schemaDef.push(TAB + 'subscription: ' + schema.subscriptionType.name);
    }
    schemaDef.push('}');

    def.push(utilDefinition());
    def.push(schemaDef.join(EOL));
    schema.types.forEach((type: SchemaType) => {

        if (type) {
            switch (type.kind) {

                case SCALAR:
                    return def.push(scalarToDefinition(type, scalarAlias[type.name]));

                case OBJECT:
                    return def.push(typeToDefinition(type));

                case INTERFACE:
                    return def.push(interfaceToDefinition(type));

                case UNION:
                    return def.push(unionToDefinition(type));

                case INPUT_OBJECT:
                    return def.push(inputToDefinition(type));

                case ENUM:
                    return def.push(enumToDefinition(type));

                default:
                    throw new Error('Unexpected type: ' + type.kind);
            }
        }
    });

    return def.join(EOL + EOL);
}