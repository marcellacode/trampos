-- Jobera: seed catalog data + demo user dashboard content

-- Fixed UUIDs for deterministic references
-- Demo user: created via auth, profile auto-created by trigger

-- ---------------------------------------------------------------------------
-- Companies
-- ---------------------------------------------------------------------------
insert into public.companies (id, slug, name, logo, brand_color, segment, employees_label, market_years, rating, verified, environment, remote_friendly, href)
values
  ('11111111-1111-1111-1111-111111111101', 'nubank', 'Nubank', 'Nu', '#820AD1', 'Fintech · Scale-up', '8.000+', 12, 4.70, true, 'scale_up', true, '/dashboard/empresas/nubank'),
  ('11111111-1111-1111-1111-111111111102', 'google', 'Google', 'G', '#4285F4', 'Big Tech', '150.000+', 26, 4.80, true, 'corporativa', true, '/dashboard/empresas/google'),
  ('11111111-1111-1111-1111-111111111103', 'microsoft', 'Microsoft', 'MS', '#00A4EF', 'Big Tech', '220.000+', 49, 4.75, true, 'corporativa', true, '/dashboard/empresas/microsoft'),
  ('11111111-1111-1111-1111-111111111104', 'amazon', 'Amazon', 'A', '#FF9900', 'E-commerce · Cloud', '1.500.000+', 30, 4.50, true, 'corporativa', true, '/dashboard/empresas/amazon'),
  ('11111111-1111-1111-1111-111111111105', 'ifood', 'iFood', 'iF', '#EA1D2C', 'Foodtech', '5.000+', 11, 4.40, true, 'scale_up', true, '/dashboard/empresas/ifood'),
  ('11111111-1111-1111-1111-111111111106', 'mercado-livre', 'Mercado Livre', 'ML', '#FFE600', 'E-commerce', '20.000+', 25, 4.60, true, 'corporativa', false, '/dashboard/empresas/mercado-livre'),
  ('11111111-1111-1111-1111-111111111107', 'uber', 'Uber', 'U', '#FFFFFF', 'Mobility', '30.000+', 15, 4.30, true, 'corporativa', true, '/dashboard/empresas/uber'),
  ('11111111-1111-1111-1111-111111111108', 'spotify', 'Spotify', 'S', '#1DB954', 'Streaming', '9.000+', 18, 4.55, true, 'scale_up', true, '/dashboard/empresas/spotify'),
  ('11111111-1111-1111-1111-111111111109', 'picpay', 'PicPay', 'PP', '#21C25E', 'Fintech', '3.000+', 8, 4.45, true, 'scale_up', true, '/dashboard/empresas/picpay')
on conflict (slug) do update set
  name = excluded.name,
  logo = excluded.logo,
  brand_color = excluded.brand_color,
  segment = excluded.segment,
  employees_label = excluded.employees_label,
  market_years = excluded.market_years,
  rating = excluded.rating,
  verified = excluded.verified,
  environment = excluded.environment,
  remote_friendly = excluded.remote_friendly,
  href = excluded.href;

insert into public.company_benefits (company_id, benefit, sort_order)
values
  ('11111111-1111-1111-1111-111111111101', 'Plano de saúde premium', 0),
  ('11111111-1111-1111-1111-111111111101', 'Stock options', 1),
  ('11111111-1111-1111-1111-111111111101', 'Auxílio home office', 2),
  ('11111111-1111-1111-1111-111111111106', 'PLR', 0),
  ('11111111-1111-1111-1111-111111111106', 'Vale refeição', 1),
  ('11111111-1111-1111-1111-111111111109', 'Gympass', 0)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------
insert into public.jobs (id, slug, company_id, title, location, salary_display, salary_min, salary_max, remote, published_at, verified, ai_summary, is_active)
values
  ('22222222-2222-2222-2222-222222222201', 'nubank-senior-frontend', '11111111-1111-1111-1111-111111111101', 'Senior Frontend Engineer', 'Remoto · Brasil', 'R$ 11k – R$ 14k', 11000, 14000, true, '2026-07-18', true, 'Vaga altamente compatível com perfis senior em React e TypeScript em fintech.', true),
  ('22222222-2222-2222-2222-222222222202', 'ml-frontend', '11111111-1111-1111-1111-111111111106', 'Frontend Engineer', 'Híbrido · São Paulo', 'R$ 10k – R$ 12k', 10000, 12000, false, '2026-07-20', true, 'Oportunidade sólida para frontend com foco em escala e e-commerce.', true),
  ('22222222-2222-2222-2222-222222222203', 'picpay-frontend', '11111111-1111-1111-1111-111111111109', 'Senior Frontend', 'Remoto · Brasil', 'R$ 9,5k – R$ 12k', 9500, 12000, true, '2026-07-19', true, 'Vaga remota em fintech com stack moderna e autonomia técnica.', true),
  ('22222222-2222-2222-2222-222222222204', 'google-frontend', '11111111-1111-1111-1111-111111111102', 'Software Engineer, Frontend', 'Remoto · Brasil', 'R$ 18k – R$ 25k', 18000, 25000, true, '2026-07-15', true, 'Posição premium para engenheiros frontend de alto impacto.', true),
  ('22222222-2222-2222-2222-222222222205', 'ifood-react', '11111111-1111-1111-1111-111111111105', 'React Engineer', 'Remoto · Brasil', 'R$ 12k – R$ 15k', 12000, 15000, true, '2026-07-17', true, 'Time de produto com forte cultura de experimentação.', true)
on conflict (slug) do update set
  title = excluded.title,
  location = excluded.location,
  salary_display = excluded.salary_display,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  remote = excluded.remote,
  published_at = excluded.published_at,
  verified = excluded.verified,
  ai_summary = excluded.ai_summary,
  is_active = excluded.is_active;

-- Job stack
insert into public.job_stack (job_id, tech_name, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'React', 0),
  ('22222222-2222-2222-2222-222222222201', 'TypeScript', 1),
  ('22222222-2222-2222-2222-222222222201', 'Node.js', 2),
  ('22222222-2222-2222-2222-222222222201', 'AWS', 3),
  ('22222222-2222-2222-2222-222222222201', 'Docker', 4),
  ('22222222-2222-2222-2222-222222222202', 'React', 0),
  ('22222222-2222-2222-2222-222222222202', 'TypeScript', 1),
  ('22222222-2222-2222-2222-222222222203', 'React', 0),
  ('22222222-2222-2222-2222-222222222203', 'Next.js', 1)
on conflict do nothing;

-- Job benefits
insert into public.job_benefits (job_id, benefit, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'Plano de saúde premium', 0),
  ('22222222-2222-2222-2222-222222222201', 'Stock options', 1),
  ('22222222-2222-2222-2222-222222222201', 'Auxílio home office', 2),
  ('22222222-2222-2222-2222-222222222201', 'Licença parental estendida', 3)
on conflict do nothing;

-- Job stats
insert into public.job_stats (job_id, response_days, process_days, steps, candidates) values
  ('22222222-2222-2222-2222-222222222201', 5, 21, 3, 847),
  ('22222222-2222-2222-2222-222222222202', 7, 28, 5, 1200),
  ('22222222-2222-2222-2222-222222222203', 4, 18, 4, 620)
on conflict (job_id) do update set
  response_days = excluded.response_days,
  process_days = excluded.process_days,
  steps = excluded.steps,
  candidates = excluded.candidates;

-- Job sections (Nubank detail)
insert into public.job_section_items (job_id, section_type, content, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'summary', 'Time de engenharia responsável por produtos core do app Nubank.', 0),
  ('22222222-2222-2222-2222-222222222201', 'summary', 'Ambiente de alta autonomia com foco em impacto e qualidade de código.', 1),
  ('22222222-2222-2222-2222-222222222201', 'responsibilities', 'Desenvolver features críticas em React com TypeScript', 0),
  ('22222222-2222-2222-2222-222222222201', 'responsibilities', 'Participar de code reviews e decisões de arquitetura frontend', 1),
  ('22222222-2222-2222-2222-222222222201', 'requirements', '5+ anos de experiência com React', 0),
  ('22222222-2222-2222-2222-222222222201', 'requirements', 'TypeScript avançado', 1),
  ('22222222-2222-2222-2222-222222222201', 'differentials', 'Experiência com microfrontends', 0),
  ('22222222-2222-2222-2222-222222222201', 'differentials', 'Conhecimento em AWS', 1)
on conflict do nothing;

-- Culture, hiring, faqs, interview questions
insert into public.job_culture_indicators (job_id, label, score, description, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'Autonomia', 88, 'Times com alta liberdade de decisão técnica', 0),
  ('22222222-2222-2222-2222-222222222201', 'Inovação', 92, 'Cultura de experimentação e aprendizado contínuo', 1),
  ('22222222-2222-2222-2222-222222222201', 'Work-life', 75, 'Flexibilidade remota, ritmo intenso em sprints', 2),
  ('22222222-2222-2222-2222-222222222201', 'Diversidade', 85, 'Compromisso público com inclusão', 3)
on conflict do nothing;

insert into public.job_hiring_stages (job_id, label, avg_days, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'Triagem', 3, 0),
  ('22222222-2222-2222-2222-222222222201', 'Técnica', 7, 1),
  ('22222222-2222-2222-2222-222222222201', 'Cultural + Oferta', 11, 2)
on conflict do nothing;

insert into public.job_faqs (job_id, question, answer, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'O processo é 100% remoto?', 'Sim, todas as etapas são realizadas online.', 0),
  ('22222222-2222-2222-2222-222222222201', 'Preciso de inglês fluente?', 'Intermediário é suficiente para o dia a dia.', 1)
on conflict do nothing;

insert into public.job_interview_questions (job_id, tech, question, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'React', 'Como você otimizaria re-renders em uma lista com 10k itens?', 0),
  ('22222222-2222-2222-2222-222222222201', 'TypeScript', 'Explique a diferença entre Pick, Omit e Partial.', 1)
on conflict do nothing;

insert into public.job_team_info (job_id, team_name, team_size, average_tenure_years, is_available) values
  ('22222222-2222-2222-2222-222222222201', 'Equipe de Engenharia', 42, 3.4, true)
on conflict (job_id) do update set
  team_name = excluded.team_name,
  team_size = excluded.team_size,
  average_tenure_years = excluded.average_tenure_years,
  is_available = excluded.is_available;

insert into public.job_team_stack (job_id, tech_name, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'React', 0),
  ('22222222-2222-2222-2222-222222222201', 'Node', 1),
  ('22222222-2222-2222-2222-222222222201', 'Go', 2),
  ('22222222-2222-2222-2222-222222222201', 'AWS', 3)
on conflict do nothing;

insert into public.job_ai_summary_reasons (job_id, reason, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'Stack principal já dominada', 0),
  ('22222222-2222-2222-2222-222222222201', 'Salário acima da expectativa', 1),
  ('22222222-2222-2222-2222-222222222201', 'Processo enxuto (3 etapas)', 2)
on conflict do nothing;

insert into public.job_related (job_id, related_job_id, sort_order) values
  ('22222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222202', 0),
  ('22222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222203', 1)
on conflict do nothing;

insert into public.job_similar_companies (job_id, company_id, sort_order) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111109', 0),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111106', 1)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Market reference data
-- ---------------------------------------------------------------------------
insert into public.market_trends (tech_name, change_percent, demand_score, region_code, recorded_at) values
  ('React', 12.5, 92, 'BR', current_date),
  ('TypeScript', 18.2, 88, 'BR', current_date),
  ('Node.js', 8.4, 75, 'BR', current_date),
  ('AWS', 15.0, 80, 'BR', current_date)
on conflict do nothing;

insert into public.salary_market_data (tech_name, min_salary, avg_salary, max_salary, region_code, recorded_at) values
  ('React', 8000, 12000, 18000, 'BR', current_date),
  ('TypeScript', 9000, 13000, 20000, 'BR', current_date),
  ('Node.js', 7000, 11000, 16000, 'BR', current_date),
  ('AWS', 10000, 15000, 22000, 'BR', current_date)
on conflict do nothing;

insert into public.market_insights (tech_name, change_percent, region_code, recorded_at) values
  ('React', 12.5, 'BR', current_date),
  ('TypeScript', 18.2, 'BR', current_date),
  ('Docker', 22.0, 'BR', current_date)
on conflict do nothing;

insert into public.opportunity_regions (country_code, country_name, flag_emoji, opportunity_count, map_x, map_y, region_code, recorded_at) values
  ('BR', 'Brasil', '🇧🇷', 1240, 42, 68, 'global', current_date),
  ('US', 'Estados Unidos', '🇺🇸', 890, 22, 35, 'global', current_date),
  ('PT', 'Portugal', '🇵🇹', 210, 48, 32, 'global', current_date),
  ('DE', 'Alemanha', '🇩🇪', 340, 52, 28, 'global', current_date)
on conflict do nothing;

insert into public.testimonials (name, role_title, company_name, avatar_url, quote, is_published, sort_order) values
  ('Ana Silva', 'Frontend Engineer', 'Nubank', '', 'A Jobera encontrou vagas que eu nem sabia que existiam. Em 2 semanas recebi 3 convites.', true, 0),
  ('Carlos Mendes', 'Tech Lead', 'iFood', '', 'A IA personalizou meu currículo para cada vaga. Taxa de resposta subiu 4x.', true, 1)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Demo user (email: demo@jobera.app / password: demo123456)
-- ---------------------------------------------------------------------------
do $$
declare
  demo_id uuid := '33333333-3333-3333-3333-333333333301';
  v_match_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'demo@jobera.app') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      demo_id,
      'authenticated',
      'authenticated',
      'demo@jobera.app',
      crypt('demo123456', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo User","name":"Demo User"}'::jsonb,
      now(), now(),
      '', '', '', ''
    );
  else
    select id into demo_id from auth.users where email = 'demo@jobera.app';
  end if;

  update public.profiles set
    full_name = 'Demo User',
    first_name = 'Demo',
    initials = 'DU',
    avatar_initials = 'DU',
    "current_role" = 'Senior Frontend Engineer',
    summary = 'Engenheiro frontend com 6+ anos de experiência em React, TypeScript e produtos digitais de alta escala.',
    seniority = 'Senior',
    goal_role = 'Tech Lead',
    goal_location = 'Remoto · Brasil',
    goal_salary = 'R$ 12k – R$ 15k',
    goal_availability_label = 'Imediato',
    availability = 'immediate',
    onboarding_completed = true
  where id = demo_id;

  insert into public.profile_skills (user_id, skill_name, sort_order) values
    (demo_id, 'React', 0),
    (demo_id, 'TypeScript', 1),
    (demo_id, 'Node.js', 2),
    (demo_id, 'AWS', 3)
  on conflict (user_id, skill_name) do nothing;

  insert into public.kpi_metrics (user_id, metric_key, label, value, suffix, delta_label, delta_positive, sparkline, color_token) values
    (demo_id, 'jobs_found', 'Vagas encontradas', 47, '', '+12 esta semana', true, array[12,18,22,28,35,42,47]::numeric[], 'blue'),
    (demo_id, 'compatibility', 'Compatibilidade média', 86, '%', '+4 pts', true, array[72,74,78,80,82,84,86]::numeric[], 'green'),
    (demo_id, 'applications', 'Candidaturas', 8, '', '+3 este mês', true, array[2,3,4,5,6,7,8]::numeric[], 'purple'),
    (demo_id, 'interviews', 'Entrevistas', 2, '', '1 agendada', true, array[0,0,1,1,1,2,2]::numeric[], 'amber')
  on conflict do nothing;

  insert into public.timeline_events (user_id, job_id, company_id, title, description, href, actor, event_kind, icon_name, color_token, glow_token, created_at) values
    (demo_id, '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Nova vaga compatível', 'Senior Frontend Engineer no Nubank — 98% de match', '/dashboard/vagas/nubank-senior-frontend', 'ai', 'job_found', 'search', 'blue', 'blue', now() - interval '2 hours'),
    (demo_id, '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Currículo personalizado', 'Adaptado para a vaga do Nubank', '/dashboard/curriculo', 'ai', 'resume_tailored', 'filetext', 'purple', 'purple', now() - interval '1 hour'),
    (demo_id, null, '11111111-1111-1111-1111-111111111101', 'Empresa visualizou seu perfil', 'Nubank abriu sua candidatura', '/dashboard/empresas', 'company', 'company_viewed', 'eye', 'nubank', 'nubank', now() - interval '30 minutes')
  on conflict do nothing;

  insert into public.dashboard_recommendations (user_id, job_id, title, description, duration_label, company_name, cta_primary, cta_secondary, href, is_active) values
    (demo_id, '22222222-2222-2222-2222-222222222201', 'Candidatar-se ao Nubank', '98% de compatibilidade · processo de 3 etapas', '~15 min', 'Nubank', 'Candidatar agora', 'Ver detalhes', '/dashboard/vagas/nubank-senior-frontend', true)
  on conflict do nothing;

  insert into public.job_applications (user_id, job_id, company_id, role_title, status, status_label, last_activity_at) values
    (demo_id, '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Senior Frontend Engineer', 'viewed', 'Perfil visualizado', now() - interval '30 minutes'),
    (demo_id, '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111106', 'Frontend Engineer', 'interested', 'Interesse registrado', now() - interval '2 days')
  on conflict do nothing;

  insert into public.employability_overviews (user_id, score, goal_score) values
    (demo_id, 78, 100)
  on conflict (user_id) do update set score = excluded.score;

  insert into public.employability_skills (user_id, label, score, uplift_percent, explanation, sort_order) values
    (demo_id, 'React', 92, 3, 'Domínio avançado alinhado com vagas senior.', 0),
    (demo_id, 'Docker', 45, 12, 'Gap principal para vagas fintech senior.', 1),
    (demo_id, 'System Design', 60, 8, 'Melhoria aqui aumenta fit para Tech Lead.', 2)
  on conflict (user_id, label) do nothing;

  insert into public.daily_missions (user_id, label, uplift_percent, href, icon_name, mission_date) values
    (demo_id, 'Atualizar portfólio GitHub', 4, '/dashboard/portfolio', 'target', current_date),
    (demo_id, 'Revisar currículo para Nubank', 6, '/dashboard/curriculo', 'filetext', current_date)
  on conflict do nothing;

  insert into public.discovery_summaries (user_id, analyzed, compatible, very_compatible, perfect) values
    (demo_id, 47, 28, 12, 3)
  on conflict (user_id) do update set
    analyzed = excluded.analyzed,
    compatible = excluded.compatible,
    very_compatible = excluded.very_compatible,
    perfect = excluded.perfect;

  insert into public.user_company_matches (user_id, company_id, compatibility) values
    (demo_id, '11111111-1111-1111-1111-111111111101', 98),
    (demo_id, '11111111-1111-1111-1111-111111111106', 95),
    (demo_id, '11111111-1111-1111-1111-111111111109', 94)
  on conflict (user_id, company_id) do update set compatibility = excluded.compatibility;

  insert into public.smart_filters (user_id, label, sort_order) values
    (demo_id, 'Remoto', 0),
    (demo_id, 'React', 1),
    (demo_id, 'Acima de R$ 10k', 2)
  on conflict do nothing;

  insert into public.job_matches (user_id, job_id, compatibility, approval_level, approval_stars, best_send_day_label, best_send_time_range, best_send_insight, why_match_summary, approval_suggestion, salary_job_min, salary_job_max, salary_market_min, salary_market_max, salary_user_expectation, salary_insight, career_impact_explanation)
  values (
    demo_id,
    '22222222-2222-2222-2222-222222222201',
    98, 'alta', 4,
    'Terça-feira', '9h – 11h', 'RH do Nubank responde 2,3× mais rápido nesse horário.',
    'Seu perfil combina fortemente com esta vaga: domínio avançado de React, experiência em fintech e histórico de entregas em escala.',
    'Reforce exemplos de liderança técnica informal na entrevista cultural.',
    11000, 14000, 9000, 13000, 12000,
    'A faixa salarial está acima da mediana de mercado para senior frontend em fintech.',
    'A IA projeta aceleração da trajetória para Tech Lead e Staff Engineer.'
  )
  on conflict (user_id, job_id) do update set compatibility = excluded.compatibility
  returning id into v_match_id;

  if v_match_id is null then
    select id into v_match_id from public.job_matches where user_id = demo_id and job_id = '22222222-2222-2222-2222-222222222201';
  end if;

  delete from public.job_match_reasons where match_id = v_match_id;
  insert into public.job_match_reasons (match_id, text, reason_type, sort_order) values
    (v_match_id, '5+ anos de React no seu currículo', 'match', 0),
    (v_match_id, 'Experiência com microfrontends', 'match', 1),
    (v_match_id, 'Docker aparece como diferencial', 'warning', 2);

  delete from public.job_match_weight_factors where match_id = v_match_id;
  insert into public.job_match_weight_factors (match_id, label, weight, sort_order) values
    (v_match_id, 'Stack técnica', 92, 0),
    (v_match_id, 'Experiência', 88, 1),
    (v_match_id, 'Cultura', 85, 2),
    (v_match_id, 'Salário', 78, 3),
    (v_match_id, 'Remoto', 100, 4);

  delete from public.job_match_approval_reasons where match_id = v_match_id;
  insert into public.job_match_approval_reasons (match_id, reason, sort_order) values
    (v_match_id, 'Stack alinhada com seu perfil', 0),
    (v_match_id, 'Experiência com React acima do requisito', 1);

  delete from public.job_match_simulation_stages where match_id = v_match_id;
  insert into public.job_match_simulation_stages (match_id, label, status, sort_order) values
    (v_match_id, 'Triagem de CV', 'pass', 0),
    (v_match_id, 'Entrevista técnica', 'pass', 1),
    (v_match_id, 'Entrevista cultural', 'warning', 2);

  delete from public.job_match_tech_comparisons where match_id = v_match_id;
  insert into public.job_match_tech_comparisons (match_id, tech_name, required_level, user_level, weight, sort_order) values
    (v_match_id, 'React', 'avancado', 'avancado', 30, 0),
    (v_match_id, 'TypeScript', 'avancado', 'intermediario', 25, 1),
    (v_match_id, 'Docker', 'intermediario', 'basico', 15, 2),
    (v_match_id, 'AWS', 'intermediario', 'intermediario', 20, 3);

  insert into public.chat_messages (user_id, context, role, content, created_at) values
    (demo_id, 'dashboard', 'assistant', 'Encontrei 3 vagas com compatibilidade acima de 95% hoje. Quer que eu prepare candidaturas?', now() - interval '10 minutes'),
    (demo_id, 'discovery', 'assistant', 'Filtrei vagas React remotas acima de R$ 10k. 12 resultados compatíveis.', now() - interval '1 hour')
  on conflict do nothing;

  insert into public.notifications (user_id, title, description, notification_group, is_unread, action_label, href, icon_name, color_token) values
    (demo_id, 'Nubank visualizou seu perfil', 'Sua candidatura foi aberta há 30 minutos', 'today', true, 'Ver vaga', '/dashboard/vagas/nubank-senior-frontend', 'eye', 'nubank'),
    (demo_id, 'Nova vaga: Mercado Livre', 'Frontend Engineer — 95% de compatibilidade', 'today', true, 'Explorar', '/dashboard/vagas/ml-frontend', 'briefcase', 'amber')
  on conflict do nothing;
end $$;
