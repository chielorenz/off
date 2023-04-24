"use client";
import { useState } from "react";
import { useRepo } from "lib/client/repo";

export default function FollowButton(
  { uuid, following }: { uuid: string; following: boolean },
) {
  const [saving, setSaving] = useState(false);
  const [isFollowing, setFollowing] = useState(following);

  const follow = () => {
    const set = async () => {
      const repo = await useRepo();
      return repo.followUser({ uuid });
    };

    setSaving(true);

    set().then(() => {
      setSaving(false);
      setFollowing(true);
    });
  };

  const button = <button onClick={follow}>follow</button>;
  return <>{saving ? "saving..." : (isFollowing ? "following" : button)}</>;
}
