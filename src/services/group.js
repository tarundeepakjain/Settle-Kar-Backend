import Group from "../models/group.js";
import pg from "../db/pg.js"; 
class GroupService {
  async createGroup({ gname, desc, member, adminid }) {
    const group = await Group.create({
      name: gname,
      description: desc,
      members: member,
      createdBy: adminid,
    });
    /*
    const result = await pool.query(
      "INSERT INTO groups (name, description, created_by) VALUES ($1,$2,$3) RETURNING *",
      [gname, desc, adminid]
    );
    const group = result.rows[0];

    for (const m of member) {
      await pool.query(
        "INSERT INTO group_members (group_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [group.id, m]
      );
    }
    */

    return group;
  }

  async addMember({ groupid, memberid, adminid }) {
    const grp = await Group.findOne({ _id: groupid, createdBy: adminid });
    if (!grp) throw new Error("Unauthorized");
    if (grp.members.includes(memberid)) throw new Error("Already in group");

    grp.members.push(memberid);
    await grp.save();

    /*
    const result = await pool.query(
      "SELECT * FROM groups WHERE id=$1 AND created_by=$2",
      [groupid, adminid]
    );
    if (result.rows.length === 0) throw new Error("Unauthorized");

    await pool.query(
      "INSERT INTO group_members (group_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [groupid, memberid]
    );
    */

    return { message: "Member added" };
  }

  async deleteMember({ groupid, memberid, adminid }) {
    const grp = await Group.findOne({ _id: groupid, createdBy: adminid });
    if (!grp) throw new Error("Unauthorized");
    if (!grp.members.includes(memberid)) throw new Error("Not in group");

    grp.members = grp.members.filter(
      (m) => m.toString() !== memberid.toString()
    );
    await grp.save();

    /*
    const result = await pool.query(
      "SELECT * FROM groups WHERE id=$1 AND created_by=$2",
      [groupid, adminid]
    );
    if (result.rows.length === 0) throw new Error("Unauthorized");

    await pool.query(
      "DELETE FROM group_members WHERE group_id=$1 AND user_id=$2",
      [groupid, memberid]
    );
    */

    return { message: "Member deleted" };
  }

  async deleteGroup({ groupid, adminid }) {
    const grp = await Group.findOneAndDelete({
      _id: groupid,
      createdBy: adminid,
    });
    if (!grp) throw new Error("Unauthorized");

    /*
    const result = await pool.query(
      "DELETE FROM groups WHERE id=$1 AND created_by=$2 RETURNING *",
      [groupid, adminid]
    );
    if (result.rows.length === 0) throw new Error("Unauthorized");
    */

    return { message: "Group deleted" };
  }
}

export default new GroupService();
