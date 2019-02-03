import { HookNextFunction, Document } from "mongoose";

export const validateThenNext = <T extends Document>(validateFn: (doc: T) => void, next: HookNextFunction, docs: T[]): void => {
    docs.map(validateFn);
    next();
}