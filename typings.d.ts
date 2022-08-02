declare module '*.jpg';
declare module '*.png';
declare module '*.json';
import type * as monaco from 'monaco-editor-core';

declare module 'monaco-editor-core' {

    module instantiation {
        export interface ServiceIdentifier<T> {
            (...args: any[]): void;
            type: T;
        }
        export interface ServicesAccessor {
            get<T>(id: ServiceIdentifier<T>, isOptional?: typeof optional): T;
        }
        export interface IInstantiationService {
        }
        export function optional<T>(serviceIdentifier: ServiceIdentifier<T>): (target: Function, key: string, index: number) => void;
    }
}
