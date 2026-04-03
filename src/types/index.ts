export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Profile {
  user_id: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  cta_text: string;
  cta_link: string;
  trust_review_count: number;
  trust_response_time: string;
  trust_reuse_rate: string;
}

export interface ServiceCard {
  id: string;
  user_id: string;
  title: string;
  description: string;
  link: string;
  order: number;
}

export interface PublicProfile extends Profile {
  serviceCards: ServiceCard[];
  linkItems: LinkItem[];
}

export interface LinkItem {
  id: string;
  user_id: string;
  title: string;
  link: string;
  order: number;
}
