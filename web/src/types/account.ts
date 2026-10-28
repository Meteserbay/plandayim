export interface OwnedBusiness {
    id: number;
    name: string;
    slug: string;
}

export interface Account {
    id: number;
    fullName: string;
    email: string;
    businesses: OwnedBusiness[];
}
