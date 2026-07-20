import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});
export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

export const getCurrentUserSchema = z.object({
  id : z.string().describe('Id of the user')
})

export type GetCurrentUserSchemaType = z.infer<typeof getCurrentUserSchema>;


export const getUserByIdSchema = z.object({
  id : z.string().describe('Id of the user')
})

export type GetUserByIdSchemaType = z.infer<typeof getUserByIdSchema>;


export const deleteAccountSchema = z.object({
  id : z.string().describe('Id of the user')
});


export type DeleteAccountSchemaType = z.infer<typeof deleteAccountSchema>
