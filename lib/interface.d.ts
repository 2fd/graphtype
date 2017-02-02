
/**
 * Introspection types
 */
export type Introspection = {
    data: {
        __schema: Schema
    }
}

export type Schema = {
    queryType: Description,
    mutationType: Description,
    subscriptionType: Description,
    types: SchemaType[],
    directives: Directive[]
}

export type Description = {
    name: string,
    description: string,
    kind?: string,
}

export type Deprecation = {
    isDeprecated: boolean,
    deprecationReason: string,
}

export type AsDefault = {
    defaultValue: string | number | null,
}

export type SchemaType = Description & {
    fields: Field[]
    inputFields: InputValue[],
    interfaces: TypeRef[],
    enumValues: EnumValue[],
    possibleTypes: TypeRef[],
}

export type Directive = Description & {
    locations: string[],
    args: InputValue[]
}

export type EnumValue = Description & Deprecation;

export type InputValue = Description & AsDefault & {
    type: TypeRef,
}

export type Field = Description & Deprecation & {
    args: InputValue[],
    type: TypeRef
}

export type TypeRef = Description & {
    ofType?: TypeRef
}