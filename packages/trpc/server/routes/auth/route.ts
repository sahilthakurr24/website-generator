import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  deleteAccountOutputSchmea,
  getCurrentUserOutputSchema,
  getUserByIdInputSchema,
  getUserByIdOutputSchema,
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  // getSupportedAuthenticationProviders: publicProcedure
  //   .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
  //   .input(zodUndefinedModel)
  //   .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
  //   .query(async () => {
  //     const supportedMethods = await userService.getAuthenticationMethods();
  //     return supportedMethods;
  //   }),
  getCurrentUser: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get-current-user"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getCurrentUserOutputSchema)
    .query(async ({ ctx }) => {
      return await userService.getCurrentUser({ id: ctx.userId });
    }),

  getUserById: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("get-user-by-id"), tags: TAGS } })
    .input(getUserByIdInputSchema)
    .output(getUserByIdOutputSchema)
    .query(async ({ input }) => {
      return await userService.getUserById({ id: input.id });
    }),

  deleteAccount: authenticatedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("delete-account"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(deleteAccountOutputSchmea)
    .query(async ({ ctx }) => {
      return await userService.deleteAccount({ id: ctx.userId });
    }),
});
