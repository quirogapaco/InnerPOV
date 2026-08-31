create or replace function public.create_event_with_data(
  p_title text,
  p_slug text,
  p_event_date date,
  p_location_name text,
  p_latitude double precision,
  p_longitude double precision,
  p_cover_photo_url text,
  p_event_type_id uuid,
  p_custom_type_name text,
  p_status public.event_status,
  p_max_guests integer,
  p_max_photos_per_guest integer,
  p_allow_videos boolean,
  p_require_moderation boolean,
  p_user_id uuid,
  p_schedules jsonb default '[]'::jsonb,
  p_missions jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_event jsonb;
  v_schedule jsonb;
  v_mission jsonb;
begin
  if p_user_id is null then
    raise exception 'El usuario autenticado es obligatorio para crear un evento';
  end if;

  insert into public.events (
    title,
    slug,
    event_date,
    location_name,
    latitude,
    longitude,
    cover_photo_url,
    event_type_id,
    custom_type_name,
    status,
    created_by
  )
  values (
    p_title,
    p_slug,
    p_event_date,
    p_location_name,
    p_latitude,
    p_longitude,
    p_cover_photo_url,
    p_event_type_id,
    p_custom_type_name,
    p_status,
    p_user_id
  )
  returning id into v_event_id;

  insert into public.event_members (event_id, user_id, role)
  values (v_event_id, p_user_id, 'ADMIN');

  insert into public.event_settings (
    event_id,
    max_guests,
    max_photos_per_guest,
    allow_videos,
    require_moderation
  )
  values (
    v_event_id,
    p_max_guests,
    p_max_photos_per_guest,
    p_allow_videos,
    p_require_moderation
  );

  if jsonb_typeof(p_schedules) = 'array' then
    for v_schedule in select value from jsonb_array_elements(p_schedules)
    loop
      insert into public.event_schedules (
        event_id,
        title,
        slug,
        start_time,
        end_time
      )
      values (
        v_event_id,
        v_schedule->>'title',
        v_schedule->>'slug',
        (v_schedule->>'start_time')::timestamptz,
        (v_schedule->>'end_time')::timestamptz
      );
    end loop;
  end if;

  if jsonb_typeof(p_missions) = 'array' then
    for v_mission in select value from jsonb_array_elements(p_missions)
    loop
      insert into public.albums (
        event_id,
        name,
        slug,
        description,
        is_system_default
      )
      values (
        v_event_id,
        v_mission->>'name',
        v_mission->>'slug',
        v_mission->>'description',
        coalesce((v_mission->>'is_system_default')::boolean, false)
      );
    end loop;
  end if;

  select jsonb_build_object(
    'event_id', v_event_id,
    'title', p_title,
    'slug', p_slug
  ) into v_event;

  return v_event;
end;
$$;

grant execute on function public.create_event_with_data(
  text,
  text,
  date,
  text,
  double precision,
  double precision,
  text,
  uuid,
  text,
  public.event_status,
  integer,
  integer,
  boolean,
  boolean,
  uuid,
  jsonb,
  jsonb
) to authenticated;
