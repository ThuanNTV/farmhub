-- =====================================================
-- FARMHUB PERFORMANCE OPTIMIZATION SCRIPT
-- Partition và Index cho PostgreSQL
-- =====================================================

-- =====================================================
-- 1. PARTITION TABLES
-- =====================================================

-- 1.1 Partition cho bảng audit_log
-- =====================================================

-- Tạo bảng mẹ audit_log với partition
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Tạo partition cho các tháng (ví dụ: 2024)
CREATE TABLE IF NOT EXISTS audit_log_2024_01 PARTITION OF audit_log
  FOR VALUES FROM ('2024-01-01 00:00:00') TO ('2024-02-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_02 PARTITION OF audit_log
  FOR VALUES FROM ('2024-02-01 00:00:00') TO ('2024-03-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_03 PARTITION OF audit_log
  FOR VALUES FROM ('2024-03-01 00:00:00') TO ('2024-04-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_04 PARTITION OF audit_log
  FOR VALUES FROM ('2024-04-01 00:00:00') TO ('2024-05-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_05 PARTITION OF audit_log
  FOR VALUES FROM ('2024-05-01 00:00:00') TO ('2024-06-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_06 PARTITION OF audit_log
  FOR VALUES FROM ('2024-06-01 00:00:00') TO ('2024-07-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_07 PARTITION OF audit_log
  FOR VALUES FROM ('2024-07-01 00:00:00') TO ('2024-08-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_08 PARTITION OF audit_log
  FOR VALUES FROM ('2024-08-01 00:00:00') TO ('2024-09-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_09 PARTITION OF audit_log
  FOR VALUES FROM ('2024-09-01 00:00:00') TO ('2024-10-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_10 PARTITION OF audit_log
  FOR VALUES FROM ('2024-10-01 00:00:00') TO ('2024-11-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_11 PARTITION OF audit_log
  FOR VALUES FROM ('2024-11-01 00:00:00') TO ('2024-12-01 00:00:00');

CREATE TABLE IF NOT EXISTS audit_log_2024_12 PARTITION OF audit_log
  FOR VALUES FROM ('2024-12-01 00:00:00') TO ('2025-01-01 00:00:00');

-- 1.2 Partition cho bảng order
-- =====================================================

-- Tạo bảng mẹ order với partition
CREATE TABLE IF NOT EXISTS "order" (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(18,2) DEFAULT 0,
  shipping_fee NUMERIC(18,2) DEFAULT 0,
  vat_percent NUMERIC(5,2) DEFAULT 0,
  vat_amount NUMERIC(18,2) DEFAULT 0,
  payment_method_id VARCHAR(50),
  payment_details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  delivery_status VARCHAR(20) DEFAULT 'PENDING',
  delivery_address TEXT NOT NULL,
  expected_delivery_date TIMESTAMP,
  invoice_number VARCHAR(50),
  note TEXT,
  processed_by_user_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
) PARTITION BY RANGE (created_at);

-- Tạo partition cho các tháng (ví dụ: 2024)
CREATE TABLE IF NOT EXISTS "order_2024_01" PARTITION OF "order"
  FOR VALUES FROM ('2024-01-01 00:00:00') TO ('2024-02-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_02" PARTITION OF "order"
  FOR VALUES FROM ('2024-02-01 00:00:00') TO ('2024-03-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_03" PARTITION OF "order"
  FOR VALUES FROM ('2024-03-01 00:00:00') TO ('2024-04-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_04" PARTITION OF "order"
  FOR VALUES FROM ('2024-04-01 00:00:00') TO ('2024-05-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_05" PARTITION OF "order"
  FOR VALUES FROM ('2024-05-01 00:00:00') TO ('2024-06-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_06" PARTITION OF "order"
  FOR VALUES FROM ('2024-06-01 00:00:00') TO ('2024-07-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_07" PARTITION OF "order"
  FOR VALUES FROM ('2024-07-01 00:00:00') TO ('2024-08-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_08" PARTITION OF "order"
  FOR VALUES FROM ('2024-08-01 00:00:00') TO ('2024-09-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_09" PARTITION OF "order"
  FOR VALUES FROM ('2024-09-01 00:00:00') TO ('2024-10-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_10" PARTITION OF "order"
  FOR VALUES FROM ('2024-10-01 00:00:00') TO ('2024-11-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_11" PARTITION OF "order"
  FOR VALUES FROM ('2024-11-01 00:00:00') TO ('2024-12-01 00:00:00');

CREATE TABLE IF NOT EXISTS "order_2024_12" PARTITION OF "order"
  FOR VALUES FROM ('2024-12-01 00:00:00') TO ('2025-01-01 00:00:00');

-- 1.3 Partition cho bảng inventory_log
-- =====================================================

-- Tạo bảng mẹ inventory_log với partition
CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  change_quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason VARCHAR(255),
  reference_id UUID,
  reference_type VARCHAR(50),
  created_by_user_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Tạo partition cho các tháng (ví dụ: 2024)
CREATE TABLE IF NOT EXISTS inventory_log_2024_01 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-01-01 00:00:00') TO ('2024-02-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_02 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-02-01 00:00:00') TO ('2024-03-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_03 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-03-01 00:00:00') TO ('2024-04-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_04 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-04-01 00:00:00') TO ('2024-05-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_05 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-05-01 00:00:00') TO ('2024-06-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_06 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-06-01 00:00:00') TO ('2024-07-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_07 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-07-01 00:00:00') TO ('2024-08-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_08 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-08-01 00:00:00') TO ('2024-09-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_09 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-09-01 00:00:00') TO ('2024-10-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_10 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-10-01 00:00:00') TO ('2024-11-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_11 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-11-01 00:00:00') TO ('2024-12-01 00:00:00');

CREATE TABLE IF NOT EXISTS inventory_log_2024_12 PARTITION OF inventory_log
  FOR VALUES FROM ('2024-12-01 00:00:00') TO ('2025-01-01 00:00:00');

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- 2.1 Indexes cho bảng order
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "order"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "order"(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_order_delivery_status ON "order"(delivery_status);
CREATE INDEX IF NOT EXISTS idx_order_payment_method ON "order"(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_order_processed_by ON "order"(processed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_order_is_deleted ON "order"(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_order_is_active ON "order"(is_active) WHERE is_active = TRUE;

-- Composite indexes cho truy vấn phức tạp
CREATE INDEX IF NOT EXISTS idx_order_status_created_at ON "order"(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_customer_created_at ON "order"(customer_id, created_at DESC);

-- 2.2 Indexes cho bảng order_item
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_product_id ON order_item(product_id);
CREATE INDEX IF NOT EXISTS idx_order_item_created_at ON order_item(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_item_is_deleted ON order_item(is_deleted) WHERE is_deleted = FALSE;

-- 2.3 Indexes cho bảng product
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_product_name ON product(name);
CREATE INDEX IF NOT EXISTS idx_product_category_id ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_brand_id ON product(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_stock ON product(stock);
CREATE INDEX IF NOT EXISTS idx_product_price ON product(price);
CREATE INDEX IF NOT EXISTS idx_product_is_active ON product(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_is_deleted ON product(is_deleted) WHERE is_deleted = FALSE;

-- Full-text search index cho tìm kiếm sản phẩm
CREATE INDEX IF NOT EXISTS idx_product_search ON product USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- 2.4 Indexes cho bảng audit_log
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_table ON audit_log(target_table);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_id ON audit_log(target_id);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created_at ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_created_at ON audit_log(action, created_at DESC);

-- 2.5 Indexes cho bảng inventory_log
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_inventory_log_created_at ON inventory_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_log_product_id ON inventory_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_store_id ON inventory_log(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_reference ON inventory_log(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_created_by ON inventory_log(created_by_user_id);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_inventory_log_product_created_at ON inventory_log(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_log_store_created_at ON inventory_log(store_id, created_at DESC);

-- 2.6 Indexes cho các bảng khác
-- =====================================================

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customer_name ON customer(name);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_is_active ON customer(is_active) WHERE is_active = TRUE;

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON payment(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_paid_by ON payment(paid_by_user_id);

-- =====================================================
-- 3. AUTOMATIC PARTITION CREATION FUNCTION
-- =====================================================

-- Function để tạo partition tự động theo tháng
CREATE OR REPLACE FUNCTION create_monthly_partition(parent_table text, partition_date date) 
RETURNS void AS $$
DECLARE
  partition_name text;
  start_date text;
  end_date text;
  sql_command text;
BEGIN
  -- Tạo tên partition
  partition_name := parent_table || '_' || to_char(partition_date, 'YYYY_MM');
  
  -- Tạo ngày bắt đầu và kết thúc
  start_date := to_char(partition_date, 'YYYY-MM-01 00:00:00');
  end_date := to_char(partition_date + INTERVAL '1 month', 'YYYY-MM-01 00:00:00');
  
  -- Tạo lệnh SQL
  sql_command := format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L);',
    partition_name, parent_table, start_date, end_date);
  
  -- Thực thi lệnh
  EXECUTE sql_command;
  
  RAISE NOTICE 'Created partition % for table %', partition_name, parent_table;
END;
$$ LANGUAGE plpgsql;

-- Function để tạo partition cho tháng tiếp theo
CREATE OR REPLACE FUNCTION create_next_month_partitions() 
RETURNS void AS $$
DECLARE
  next_month date := date_trunc('month', current_date + interval '1 month');
BEGIN
  -- Tạo partition cho audit_log
  PERFORM create_monthly_partition('audit_log', next_month);
  
  -- Tạo partition cho order
  PERFORM create_monthly_partition('order', next_month);
  
  -- Tạo partition cho inventory_log
  PERFORM create_monthly_partition('inventory_log', next_month);
  
  RAISE NOTICE 'Created partitions for %', next_month;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. PERFORMANCE MONITORING VIEWS
-- =====================================================

-- View để theo dõi kích thước partition
CREATE OR REPLACE VIEW partition_sizes AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE tablename LIKE '%_2024_%' OR tablename LIKE '%_2025_%'
ORDER BY size_bytes DESC;

-- View để theo dõi index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- =====================================================
-- 5. MAINTENANCE SCRIPTS
-- =====================================================

-- Function để xóa partition cũ (giữ lại 12 tháng gần nhất)
CREATE OR REPLACE FUNCTION cleanup_old_partitions(months_to_keep integer DEFAULT 12) 
RETURNS void AS $$
DECLARE
  partition_record record;
  cutoff_date date;
BEGIN
  cutoff_date := date_trunc('month', current_date - (months_to_keep || ' months')::interval);
  
  FOR partition_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE tablename LIKE '%_20%_%' 
    AND tablename ~ '^[a-z_]+_20[0-9]{2}_[0-9]{2}$'
  LOOP
    -- Extract year and month from table name
    IF substring(partition_record.tablename from '20[0-9]{2}_[0-9]{2}$') < to_char(cutoff_date, 'YYYY_MM') THEN
      EXECUTE 'DROP TABLE IF EXISTS ' || partition_record.tablename;
      RAISE NOTICE 'Dropped old partition: %', partition_record.tablename;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ANALYZE TABLES FOR OPTIMIZATION
-- =====================================================

-- Analyze tất cả các bảng để cập nhật statistics
ANALYZE audit_log;
ANALYZE "order";
ANALYZE inventory_log;
ANALYZE order_item;
ANALYZE product;
ANALYZE customer;
ANALYZE payment;

-- =====================================================
-- 7. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE audit_log IS 'Audit log table partitioned by month for better performance';
COMMENT ON TABLE "order" IS 'Order table partitioned by month for better performance';
COMMENT ON TABLE inventory_log IS 'Inventory log table partitioned by month for better performance';

COMMENT ON FUNCTION create_monthly_partition(text, date) IS 'Creates a monthly partition for the specified table';
COMMENT ON FUNCTION create_next_month_partitions() IS 'Creates partitions for next month for all partitioned tables';
COMMENT ON FUNCTION cleanup_old_partitions(integer) IS 'Removes old partitions keeping specified number of months';

-- =====================================================
-- END OF SCRIPT
-- ===================================================== 