import z from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean().nullable(),
  image: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const getCurrentUserOutputSchema = z.object({
  user: userSchema.optional(),
});

export const getUserByIdInputSchema = z.object({
  id: z.string().describe("Id of the user"),
});


export const getUserByIdOutputSchema = z.object({
  user : userSchema.optional()
})

export const deleteAccountOutputSchmea = z.object({
  id : z.string().optional().describe('Id of the deleted user')
})