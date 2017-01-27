import { EOL } from 'os';
import { format } from 'util';
import * as wrap from 'word-wrap';
import {
    AsDefault,
    Deprecation,
    Description,
    EnumValue,
    Field,
    InputValue,
    Schema,
    SchemaType,
    TypeRef,
} from './interface';
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

    def.push(format('export type %s = %s;', type.name, typescriptAlias));

    return def.join(EOL);
}

/**
 * Field
 */
export function fieldToDefinition(field: Field): string {

    let def = [''];
    const assign = field.type.kind === NON_NULL ? ': ' : '?: ';

    if (field.description || field.isDeprecated) {
        def.push(descriptionToComment(field, TAB));
    }

    def.push(TAB + field.name + assign + refToDefinition(field.type) + ';');

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

    let def = [];

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

    let def = [];

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
    const assign = arg.type.kind === NON_NULL ? ': ' : '?: ';

    if (arg.description)
        def.push(descriptionToComment(arg, TAB));

    def.push(TAB + arg.name + assign + refToDefinition(arg.type) + ';');

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

    let def = [];

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

    let def = [];

    if (type.description)
        def.push(descriptionToComment(type));

    def.push(format(
        'export type %s = %s;',
        type.name,
        type.possibleTypes.map((possibleType) => possibleType.name).join(' | ')
    ));

    return def.join(EOL);
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

enum TypeOrder {
    SCALAR,
    ENUM,
    UNION,
    INTERFACE,
    OBJECT,
    INPUT_OBJECT,
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
    let response = [];
    let responseTypes = [];

    if (schema.queryType)
        responseTypes.push(schema.queryType.name);

    if (schema.mutationType)
        responseTypes.push(schema.mutationType.name);

    if (schema.subscriptionType)
        responseTypes.push(schema.subscriptionType.name);

    response.push('export interface Response {');
    response.push('');
    response.push(TAB + 'data: ' + responseTypes.join(' | ') + ' | null;');
    response.push('');
    response.push(TAB + 'errors?: ErrorResponse[];');
    response.push('}');

    response.push('');
    response.push('export interface ErrorResponse {');
    response.push('');
    response.push(TAB + 'locations: ErrorLocation[];');
    response.push('');
    response.push(TAB + 'message: string;');
    response.push('}');

    response.push('');
    response.push('export interface ErrorLocation {');
    response.push('');
    response.push(TAB + 'line: number;');
    response.push('');
    response.push(TAB + 'column: number;');
    response.push('}');

    def.push(utilDefinition());
    def.push(response.join(EOL));
    schema.types
        .sort((typeA: SchemaType, typeB: SchemaType) => {

            if (typeA.kind === typeB.kind)
                return typeA.name.localeCompare(typeB.name);

            return (TypeOrder[typeA.kind] as any) - (TypeOrder[typeB.kind] as any);
        })
        .forEach((type: SchemaType) => {

            if (type) {
                switch (type.kind) {

                    case SCALAR:
                        return def.push(scalarToDefinition(type, scalarAlias[type.name]));

                    case ENUM:
                        return def.push(enumToDefinition(type));

                    case UNION:
                        return def.push(unionToDefinition(type));

                    case INTERFACE:
                        return def.push(interfaceToDefinition(type));

                    case OBJECT:
                        return def.push(typeToDefinition(type));

                    case INPUT_OBJECT:
                        return def.push(inputToDefinition(type));

                    default:
                        throw new Error('Unexpected type: ' + type.kind);
                }
            }
        });

    return def.join(EOL + EOL);
}