import { z } from "zod"

export function createValidator<T extends z.ZodType>(schema: T) {
    return (data: z.infer<T>) => {
      try {
        schema.parse(data);
        return { success: true, errors: [] };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          };
        }
        return { success: false, errors: ['An unknown error occurred'] };
      }
    };
  }
  