import { Contract } from 'ethers';

export class RoleInfo {
    memberCount: number;
    members: string[];

    constructor(count: number, members: string[]) {
        this.memberCount = count;
        this.members = members;
    }

    public static async get(contract: Contract, role: string): Promise<RoleInfo> {
        const count = (await contract.getRoleMemberCount(role)).toNumber();
        const members: string[] = [];
        for (let i = 0; i < count; i++) {
            members.push(await contract.getRoleMember(role, i));
        }

        return new RoleInfo(count, members);
    }
}
