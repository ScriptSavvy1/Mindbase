-- ========================================
-- Mindbase Academy — Seed Data for Demo
-- Run this AFTER the initial migration
-- ========================================

-- ────────────────────────────────────────
-- Step 1: Create demo users in auth.users
-- (Required because profiles has a FK to auth.users)
-- ────────────────────────────────────────

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'aris@mindbase.dev', crypt('password123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"name":"Dr. Aris Thorne"}', NOW(), NOW(), '', ''),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sarah@mindbase.dev', crypt('password123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"name":"Sarah Chen"}', NOW(), NOW(), '', ''),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'marcus@mindbase.dev', crypt('password123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"name":"Marcus Thorne"}', NOW(), NOW(), '', ''),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'elena@mindbase.dev', crypt('password123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"name":"Elena Rodriguez"}', NOW(), NOW(), '', ''),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'david@mindbase.dev', crypt('password123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"name":"David Park"}', NOW(), NOW(), '', ''),
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@mindbase.dev', crypt('password123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"name":"Admin User"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

-- Create identity entries (required for email/password login to work)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'aris@mindbase.dev',
   jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'aris@mindbase.dev'), 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'sarah@mindbase.dev',
   jsonb_build_object('sub', '00000000-0000-0000-0000-000000000002', 'email', 'sarah@mindbase.dev'), 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'marcus@mindbase.dev',
   jsonb_build_object('sub', '00000000-0000-0000-0000-000000000003', 'email', 'marcus@mindbase.dev'), 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'elena@mindbase.dev',
   jsonb_build_object('sub', '00000000-0000-0000-0000-000000000004', 'email', 'elena@mindbase.dev'), 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 'david@mindbase.dev',
   jsonb_build_object('sub', '00000000-0000-0000-0000-000000000005', 'email', 'david@mindbase.dev'), 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000099', 'admin@mindbase.dev',
   jsonb_build_object('sub', '00000000-0000-0000-0000-000000000099', 'email', 'admin@mindbase.dev'), 'email', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────
-- Step 2: Insert/update demo profiles
-- (The trigger may have already created these, so we upsert)
-- ────────────────────────────────────────

INSERT INTO profiles (id, name, email, role, bio, title, company) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Aris Thorne', 'aris@mindbase.dev', 'instructor',
   'With over 15 years in Machine Learning and a PhD from Stanford, Aris has built large-scale AI infrastructure for Fortune 500 companies. He leads the LLM Deployment group at Neurix, specializing in low-latency inference.',
   'Lead AI Research Scientist', 'Neurix Systems'),
  ('00000000-0000-0000-0000-000000000002', 'Sarah Chen', 'sarah@mindbase.dev', 'instructor',
   'Principal ML researcher with 12 years building production recommender systems and NLP pipelines. Previously at Google Brain and Meta AI.',
   'Principal ML Researcher', 'OpenAI'),
  ('00000000-0000-0000-0000-000000000003', 'Marcus Thorne', 'marcus@mindbase.dev', 'instructor',
   'Core systems engineer specializing in high-frequency trading platforms and payment infrastructure. Built the transaction engine at a top-5 prop trading firm.',
   'Core Systems Engineer', 'Stripe'),
  ('00000000-0000-0000-0000-000000000004', 'Elena Rodriguez', 'elena@mindbase.dev', 'instructor',
   'Blockchain architect and smart contract security auditor. Led security audits for protocols managing $2B+ in TVL. Contributor to Ethereum improvement proposals.',
   'Blockchain Architect', 'Ethereum Foundation'),
  ('00000000-0000-0000-0000-000000000005', 'David Park', 'david@mindbase.dev', 'instructor',
   'Quantitative analyst with experience building algorithmic trading strategies at top hedge funds. PhD in Financial Mathematics from MIT.',
   'Quantitative Analyst', 'Goldman Sachs'),
  ('00000000-0000-0000-0000-000000000099', 'Admin User', 'admin@mindbase.dev', 'admin',
   'Platform administrator', 'Platform Admin', 'Mindbase Academy')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio,
  title = EXCLUDED.title,
  company = EXCLUDED.company;

-- ────────────────────────────────────────
-- Insert demo courses
-- ────────────────────────────────────────

INSERT INTO courses (id, title, description, category, skill_level, price, original_price, instructor_id, status, total_duration, total_lessons, total_students, average_rating, total_reviews, learning_outcomes, language) VALUES
-- AI COURSES
('c0000000-0000-0000-0000-000000000001',
 'Large Language Models in Production: From RAG to Finetuning',
 'Master the deployment of LLMs. Build robust RAG pipelines, optimize latency with vLLM, and learn to finetune Llama-3 for specialized domain tasks. This course takes you from understanding transformer architectures to deploying production-grade AI systems.',
 'ai', 'intermediate', 14900, 24900,
 '00000000-0000-0000-0000-000000000001', 'approved',
 '24.5 hours', 128, 34201, 4.90, 2400,
 ARRAY['Architect production-grade RAG systems using Pinecone and LangChain', 'Implement efficient LLM orchestration with FastAPI and Docker', 'Finetune Llama-3 using QLoRA for domain-specific knowledge', 'Master prompt engineering techniques: CoT, ReAct, and Few-shot', 'Optimize inference speeds using vLLM and NVIDIA Triton', 'Build robust evaluation frameworks for model safety and bias'],
 'English [CC]'),

('c0000000-0000-0000-0000-000000000002',
 'Machine Learning Ops (MLOps): Deploying at Scale',
 'Learn to deploy, monitor, and manage machine learning models in production environments. Cover CI/CD for ML, model versioning, feature stores, and observability dashboards.',
 'ai', 'intermediate', 12900, NULL,
 '00000000-0000-0000-0000-000000000002', 'approved',
 '18 hours', 96, 15100, 4.85, 1800,
 ARRAY['Build ML CI/CD pipelines with GitHub Actions and MLflow', 'Implement feature stores with Feast', 'Deploy models with Kubernetes and Seldon Core', 'Monitor model drift and performance in production'],
 'English'),

('c0000000-0000-0000-0000-000000000003',
 'Advanced Natural Language Processing with Transformers',
 'Deep dive into transformer architectures, attention mechanisms, and their applications in NLP. Build chatbots, summarizers, and sentiment analyzers from scratch.',
 'ai', 'advanced', 18900, NULL,
 '00000000-0000-0000-0000-000000000002', 'approved',
 '22 hours', 110, 9800, 4.80, 950,
 ARRAY['Implement transformer architectures from scratch in PyTorch', 'Train custom NER and text classification models', 'Build production chatbots with guardrails', 'Optimize model size with distillation and quantization'],
 'English'),

('c0000000-0000-0000-0000-000000000004',
 'Computer Vision & Generative Models: DALL-E to Stable Diffusion',
 'From CNNs to diffusion models — understand and implement state-of-the-art computer vision architectures. Build your own image generation pipeline.',
 'ai', 'advanced', 21900, NULL,
 '00000000-0000-0000-0000-000000000001', 'approved',
 '28 hours', 145, 7200, 4.75, 680,
 ARRAY['Understand diffusion model mathematics', 'Implement VAEs and GANs from scratch', 'Fine-tune Stable Diffusion for custom domains', 'Deploy image generation APIs'],
 'English'),

('c0000000-0000-0000-0000-000000000005',
 'Neural Networks from Scratch: A First Principles Approach',
 'Build neural networks using only NumPy. Understand backpropagation, gradient descent, and activation functions at a mathematical level before using frameworks.',
 'ai', 'beginner', 9900, NULL,
 '00000000-0000-0000-0000-000000000001', 'approved',
 '32 hours', 200, 42000, 4.95, 5200,
 ARRAY['Implement forward and backward propagation from scratch', 'Understand gradient descent variants (SGD, Adam, RMSprop)', 'Build CNNs and RNNs using only NumPy', 'Transition confidently to PyTorch and TensorFlow'],
 'English'),

-- FINTECH COURSES
('c0000000-0000-0000-0000-000000000006',
 'High-Frequency Trading in Go: Low Latency Mastery',
 'Build a complete HFT system in Go. Cover order book mechanics, market microstructure, latency optimization, and colocation strategies used by professional prop trading firms.',
 'fintech', 'advanced', 19900, NULL,
 '00000000-0000-0000-0000-000000000003', 'approved',
 '18 hours', 96, 1500, 4.80, 198,
 ARRAY['Build a complete order book engine in Go', 'Implement FPGA-aware latency optimization', 'Understand market microstructure and order types', 'Design colocation-grade networking stacks'],
 'English'),

('c0000000-0000-0000-0000-000000000007',
 'Advanced Smart Contract Auditing & Security',
 'Learn to find and exploit vulnerabilities in Solidity smart contracts. Cover reentrancy, flash loan attacks, oracle manipulation, and formal verification techniques.',
 'fintech', 'advanced', 24900, NULL,
 '00000000-0000-0000-0000-000000000004', 'approved',
 '15 hours', 84, 850, 5.00, 142,
 ARRAY['Identify common Solidity vulnerability patterns', 'Perform professional-grade smart contract audits', 'Use formal verification tools (Certora, Scribble)', 'Understand and prevent flash loan attack vectors'],
 'English'),

('c0000000-0000-0000-0000-000000000008',
 'Quantitative Trading Algorithms: Theory and Implementation',
 'Design and backtest algorithmic trading strategies. Cover statistical arbitrage, mean reversion, momentum strategies, and risk management frameworks.',
 'fintech', 'intermediate', 15900, NULL,
 '00000000-0000-0000-0000-000000000005', 'approved',
 '20 hours', 108, 5600, 4.70, 620,
 ARRAY['Design statistical arbitrage strategies', 'Implement robust backtesting frameworks', 'Build risk management and position sizing systems', 'Integrate with broker APIs for live trading'],
 'English'),

('c0000000-0000-0000-0000-000000000009',
 'Zero to Fintech Engineer: The Complete Career Path',
 'The definitive roadmap course covering everything from financial market structures to building production payment systems. Includes hands-on projects with real APIs.',
 'fintech', 'beginner', 39900, NULL,
 '00000000-0000-0000-0000-000000000003', 'approved',
 '85 hours', 320, 24500, 4.95, 3200,
 ARRAY['Understand global financial market infrastructure', 'Build payment processing systems from scratch', 'Implement KYC/AML compliance flows', 'Design scalable ledger and accounting systems'],
 'English [CC]'),

('c0000000-0000-0000-0000-000000000010',
 'DeFi Protocol Engineering: AMMs, Lending, and Derivatives',
 'Build decentralized finance protocols from scratch. Implement automated market makers, lending pools, and synthetic asset platforms on Ethereum and Solana.',
 'fintech', 'advanced', 29900, NULL,
 '00000000-0000-0000-0000-000000000004', 'approved',
 '25 hours', 130, 3400, 4.85, 420,
 ARRAY['Implement Uniswap V3-style concentrated liquidity AMMs', 'Build collateralized lending protocols (Aave-style)', 'Design oracle-resistant pricing mechanisms', 'Deploy and verify contracts on multiple EVM chains'],
 'English')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────
-- Insert demo modules and lessons for the first course
-- ────────────────────────────────────────

INSERT INTO modules (id, course_id, title, description, "order") VALUES
  ('m0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Foundation of Modern LLMs', 'Introduction to Transformer architecture and Attention mechanisms.', 1),
  ('m0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Vector Databases & RAG Pipelines', 'Retrieval Augmented Generation using Pinecone, Weaviate, and Milvus.', 2),
  ('m0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Advanced Finetuning with QLoRA', 'Quantization and Low-Rank Adaptation for consumer GPUs.', 3),
  ('m0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Production Deployment & Optimization', 'Deploy LLMs at scale with vLLM, Triton, and Kubernetes.', 4),
  ('m0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Evaluation & Safety', 'Build robust evaluation frameworks and implement guardrails.', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, module_id, course_id, title, duration, "order", is_free_preview) VALUES
  -- Module 1
  ('l0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'The History of NLP: From RNNs to GPT', '12:45', 1, true),
  ('l0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Understanding Self-Attention in 10 Minutes', '09:20', 2, true),
  ('l0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Multi-Head Attention Deep Dive', '18:30', 3, false),
  ('l0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Setting up your Python environment with Conda', '15:10', 4, false),
  ('l0000000-0000-0000-0000-000000000005', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'HuggingFace Hub: The GitHub of AI', '23:30', 5, false),
  -- Module 2
  ('l0000000-0000-0000-0000-000000000006', 'm0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'What is RAG and Why Does it Matter?', '14:20', 1, false),
  ('l0000000-0000-0000-0000-000000000007', 'm0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Building your first Pinecone index', '28:15', 2, false),
  ('l0000000-0000-0000-0000-000000000008', 'm0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Advanced chunking strategies', '19:40', 3, false),
  ('l0000000-0000-0000-0000-000000000009', 'm0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Hybrid search: Combining dense and sparse', '22:15', 4, false),
  -- Module 3
  ('l0000000-0000-0000-0000-000000000010', 'm0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Understanding LoRA and QLoRA', '22:10', 1, false),
  ('l0000000-0000-0000-0000-000000000011', 'm0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Preparing training data for finetuning', '18:55', 2, false),
  ('l0000000-0000-0000-0000-000000000012', 'm0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Training a custom Llama-3 model', '35:20', 3, false),
  -- Module 4
  ('l0000000-0000-0000-0000-000000000013', 'm0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Introduction to vLLM', '16:45', 1, false),
  ('l0000000-0000-0000-0000-000000000014', 'm0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Kubernetes deployment with Helm', '28:30', 2, false),
  ('l0000000-0000-0000-0000-000000000015', 'm0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Load balancing and auto-scaling', '24:10', 3, false),
  -- Module 5
  ('l0000000-0000-0000-0000-000000000016', 'm0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Building evaluation benchmarks', '20:30', 1, false),
  ('l0000000-0000-0000-0000-000000000017', 'm0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Implementing safety guardrails', '25:15', 2, false),
  ('l0000000-0000-0000-0000-000000000018', 'm0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Red teaming your LLM deployment', '18:40', 3, false)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────
-- Insert demo reviews
-- ────────────────────────────────────────

INSERT INTO reviews (id, course_id, user_id, user_name, rating, comment) VALUES
  ('r0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Sarah Jenkins', 5,
   'The section on vLLM optimization alone saved our team months of R&D. Aris explains complex latency bottlenecks with perfect clarity.'),
  ('r0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Markus Weber', 5,
   'Best technical course I''ve taken. It goes beyond the basic tutorials you find on YouTube and actually addresses production issues.'),
  ('r0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Anya Petrov', 4,
   'Excellent course. The hands-on projects are incredibly well-designed. Only giving 4 stars because I wish the evaluation module was longer.'),
  ('r0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Daniel Okafor', 5,
   'This is THE course for understanding neural networks. I finally understand backpropagation after years of just using PyTorch blindly.'),
  ('r0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'Alex Sorenson', 5,
   'Mindbase is the first platform that didn''t treat me like a beginner. The HFT in Go course literally helped me land my senior role at a top prop firm.')
ON CONFLICT (id) DO NOTHING;
