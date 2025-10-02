const Database = require('better-sqlite3');
const fs = require('fs');

console.log('Starting CMS migration...');

try {
  const db = new Database('./database.sqlite');
  console.log('Database opened successfully');
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const existingTables = tables.map(t => t.name);
  
  // Content Pages table
  if (!existingTables.includes('content_pages')) {
    console.log('Creating content_pages table...');
    db.prepare(`
      CREATE TABLE content_pages (
        id TEXT PRIMARY KEY,
        page_key TEXT NOT NULL UNIQUE, -- homepage, about, privacy, etc.
        title TEXT NOT NULL,
        meta_description TEXT,
        meta_keywords TEXT,
        content TEXT, -- JSON with sections
        is_published INTEGER DEFAULT 1,
        seo_title TEXT,
        canonical_url TEXT,
        og_title TEXT,
        og_description TEXT,
        og_image TEXT,
        last_edited_by TEXT,
        version INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Insert default homepage content
    db.prepare(`
      INSERT INTO content_pages (
        id, page_key, title, meta_description, content, seo_title
      ) VALUES (
        'home-' || hex(randomblob(8)),
        'homepage',
        'AutoMentor - Professional Car Mechanic Chat',
        'Get instant expert automotive advice from professional mechanics. Chat about car problems, diagnostics, and maintenance.',
        '{"hero":{"title":"Get Expert Car Advice Instantly","subtitle":"Chat with professional mechanics about your vehicle problems","buttonText":"Start Chat Now","backgroundImage":""},"features":[{"title":"Expert Mechanics","description":"Certified automotive professionals","icon":"wrench"},{"title":"Instant Help","description":"Get answers in real-time","icon":"clock"},{"title":"All Vehicle Types","description":"Cars, trucks, motorcycles & more","icon":"car"}],"testimonials":[{"name":"John Smith","text":"Saved me hundreds on unnecessary repairs!","rating":5},{"name":"Sarah Wilson","text":"Quick and professional advice","rating":5}],"pricing":{"title":"Simple Pricing","plans":[{"name":"Basic Chat","price":"19.99","features":["30-minute chat session","Expert mechanic advice","Problem diagnosis"]},{"name":"Premium Support","price":"49.99","features":["Unlimited chat","Priority support","Photo diagnostics","Video calls"]}]}}',
        'AutoMentor - Expert Car Mechanic Advice Online | Professional Automotive Help'
      )
    `).run();
    
    console.log('content_pages table created');
  }
  
  // FAQ table
  if (!existingTables.includes('faqs')) {
    console.log('Creating faqs table...');
    db.prepare(`
      CREATE TABLE faqs (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT DEFAULT 'general', -- general, technical, billing, etc.
        sort_order INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 1,
        views_count INTEGER DEFAULT 0,
        helpful_votes INTEGER DEFAULT 0,
        not_helpful_votes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Insert default FAQs
    const defaultFaqs = [
      {
        question: "How does the mechanic chat work?",
        answer: "Simply start a chat session, describe your car problem, and our certified mechanics will provide expert advice in real-time. You can share photos and ask follow-up questions.",
        category: "general"
      },
      {
        question: "What types of vehicles do you support?",
        answer: "We support all types of vehicles including cars, trucks, motorcycles, RVs, and commercial vehicles. Our mechanics have experience with all major brands and models.",
        category: "technical"
      },
      {
        question: "How much does it cost?",
        answer: "We offer flexible pricing starting from $19.99 for a basic 30-minute chat session. Premium plans include unlimited chat and priority support.",
        category: "billing"
      },
      {
        question: "Are the mechanics certified?",
        answer: "Yes, all our mechanics are ASE certified professionals with years of hands-on experience. They undergo regular training to stay updated with the latest automotive technology.",
        category: "general"
      },
      {
        question: "Can I get a refund if I'm not satisfied?",
        answer: "We offer a 100% satisfaction guarantee. If you're not happy with the service, contact us within 24 hours for a full refund.",
        category: "billing"
      }
    ];
    
    for (let i = 0; i < defaultFaqs.length; i++) {
      const faq = defaultFaqs[i];
      db.prepare(`
        INSERT INTO faqs (id, question, answer, category, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'faq-' + Date.now() + '-' + i,
        faq.question,
        faq.answer,
        faq.category,
        i
      );
    }
    
    console.log('faqs table created');
  }
  
  // Testimonials table
  if (!existingTables.includes('testimonials')) {
    console.log('Creating testimonials table...');
    db.prepare(`
      CREATE TABLE testimonials (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_avatar TEXT,
        testimonial_text TEXT NOT NULL,
        rating INTEGER DEFAULT 5, -- 1-5 stars
        vehicle_info TEXT, -- Car model they got help with
        is_featured INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 0,
        source TEXT DEFAULT 'manual', -- manual, automatic, imported
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Insert default testimonials
    const defaultTestimonials = [
      {
        name: "John Smith",
        email: "john@example.com",
        text: "The mechanic quickly diagnosed my engine problem and saved me from an expensive dealership visit. Highly recommended!",
        rating: 5,
        vehicle: "2018 Toyota Camry",
        featured: 1
      },
      {
        name: "Sarah Wilson", 
        email: "sarah@example.com",
        text: "Amazing service! Got help with my brake issues at 11 PM. The mechanic was very professional and knowledgeable.",
        rating: 5,
        vehicle: "2020 Honda Civic",
        featured: 1
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com", 
        text: "Saved me hundreds of dollars by helping me fix the problem myself. The step-by-step guidance was perfect.",
        rating: 5,
        vehicle: "2019 Ford F-150",
        featured: 1
      }
    ];
    
    for (let i = 0; i < defaultTestimonials.length; i++) {
      const t = defaultTestimonials[i];
      db.prepare(`
        INSERT INTO testimonials (id, customer_name, customer_email, testimonial_text, rating, vehicle_info, is_featured, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'test-' + Date.now() + '-' + i,
        t.name,
        t.email, 
        t.text,
        t.rating,
        t.vehicle,
        t.featured,
        1
      );
    }
    
    console.log('testimonials table created');
  }
  
  // Media Library table
  if (!existingTables.includes('media_library')) {
    console.log('Creating media_library table...');
    db.prepare(`
      CREATE TABLE media_library (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        file_type TEXT NOT NULL, -- image, video, document
        alt_text TEXT,
        caption TEXT,
        is_used INTEGER DEFAULT 0,
        used_in TEXT, -- JSON array of where it's used
        uploaded_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    db.prepare(`CREATE INDEX idx_media_type ON media_library(file_type)`).run();
    db.prepare(`CREATE INDEX idx_media_date ON media_library(created_at)`).run();
    
    console.log('media_library table created');
  }
  
  db.close();
  console.log('CMS migration completed successfully!');
  
} catch (error) {
  console.error('CMS migration failed:', error);
  process.exit(1);
}