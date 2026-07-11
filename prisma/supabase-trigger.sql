-- Create the function to insert into public.User when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Insert into public.User
  insert into public."User" (
    id, 
    email, 
    "firstName", 
    "lastName", 
    role,
    "updatedAt"
  )
  values (
    new.id,
    new.email,
    -- Extract first name from raw_user_meta_data if it exists, else use email prefix
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    -- Default last name to empty string if not provided in meta_data
    '',
    -- Extract role from meta_data and uppercase it, default to CLIENT
    coalesce(
      upper(new.raw_user_meta_data->>'role')::"Role",
      'CLIENT'::"Role"
    ),
    now()
  );

  -- 2. Insert into public.TalentProfile if role is TALENT
  if coalesce(upper(new.raw_user_meta_data->>'role'), 'CLIENT') = 'TALENT' then
    insert into public."TalentProfile" (
      id,
      "userId",
      slug,
      status,
      "onboardingStep",
      "onboardingCompleted",
      "projectCount",
      "profileViews",
      "updatedAt"
    )
    values (
      gen_random_uuid()::text,
      new.id,
      coalesce(
        lower(regexp_replace(new.raw_user_meta_data->>'full_name', '[^a-zA-Z0-9]+', '-', 'g')),
        split_part(new.email, '@', 1)
      ) || '-' || substr(new.id::text, 1, 8),
      'DRAFT'::"TalentProfileStatus",
      1,
      false,
      0,
      0,
      now()
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
