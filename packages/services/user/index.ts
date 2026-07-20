import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import {
  deleteAccountSchema,
  DeleteAccountSchemaType,
  getCurrentUserSchema,
  GetCurrentUserSchemaType,
  getUserByIdSchema,
  GetUserByIdSchemaType,
} from "./model";

class UserService {
  public async getCurrentUser(payload: GetCurrentUserSchemaType) {
    const { id } = await getCurrentUserSchema.parseAsync(payload);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) throw new Error(`user with id ${id} not found!!!`);
    return { user };
  }

  public async getUserById(payload: GetUserByIdSchemaType) {
    const { id } = await getUserByIdSchema.parseAsync(payload);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) throw new Error(`user with id ${id} not found!!!`);
    return { user };
  }

  public async deleteAccount(payload: DeleteAccountSchemaType) {
    const { id } = await deleteAccountSchema.parseAsync(payload);

    const [deletedUser] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    return { id: deletedUser?.id };
  }
}

export default UserService;
