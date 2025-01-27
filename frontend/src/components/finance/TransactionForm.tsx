import React, { useEffect } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, Space } from 'antd';
import { TransactionFormData, TransactionFormProps, TransactionType, TransactionStatus, TransactionCategory } from '@/types/finance/finance.type';
import { useFinanceAccounts } from '@/hooks/useFinanceAccounts';
import { Currency } from '@/types/enums';
import dayjs from 'dayjs';

const { Option } = Select;

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<TransactionFormData>();
  const { accounts, isLoading: isLoadingAccounts } = useFinanceAccounts();

  useEffect(() => {
    if (initialData) {
      // 将日期字符串转换为 dayjs 对象
      const formData = {
        ...initialData,
        date: initialData.date ? dayjs(initialData.date) : undefined,
        postedDate: initialData.postedDate ? dayjs(initialData.postedDate) : undefined,
      };
      form.setFieldsValue(formData);
    }
  }, [initialData, form]);

  const handleSubmit = async (values: TransactionFormData) => {
    // 将 dayjs 对象转换为 ISO 日期字符串
    const formattedData = {
      ...values,
      date: values.date?.toISOString(),
      postedDate: values.postedDate?.toISOString(),
    };
    await onSubmit(formattedData);
  };

  const handleTransactionTypeChange = (type: TransactionType) => {
    // 根据交易类型设置默认状态
    if (type === TransactionType.TRANSFER_OUT || type === TransactionType.TRANSFER_IN) {
      form.setFieldValue('category', TransactionCategory.TRANSFER);
    }
    // 显示/隐藏关联账户字段
    if (type === TransactionType.TRANSFER_OUT || type === TransactionType.TRANSFER_IN) {
      form.setFieldValue('linkedAccountId', undefined);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: TransactionStatus.PENDING,
        currency: Currency.CAD,
      }}
    >
      {/* 基本信息 */}
      <Form.Item
        name="accountId"
        label="账户"
        rules={[{ required: true, message: '请选择账户' }]}
      >
        <Select loading={isLoadingAccounts} disabled={isLoadingAccounts}>
          {accounts?.map(account => (
            <Option key={account.id} value={account.id}>
              {account.accountName} ({account.bankName})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="type"
        label="交易类型"
        rules={[{ required: true, message: '请选择交易类型' }]}
      >
        <Select onChange={handleTransactionTypeChange}>
          {Object.values(TransactionType).map(type => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* 转账相关字段 */}
      {(form.getFieldValue('type') === TransactionType.TRANSFER_OUT ||
        form.getFieldValue('type') === TransactionType.TRANSFER_IN) && (
        <Form.Item
          name="linkedAccountId"
          label="关联账户"
          rules={[{ required: true, message: '请选择关联账户' }]}
        >
          <Select loading={isLoadingAccounts} disabled={isLoadingAccounts}>
            {accounts?.map(account => (
              <Option key={account.id} value={account.id}>
                {account.accountName} ({account.bankName})
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {/* 金额和货币 */}
      <Space>
        <Form.Item
          name="amount"
          label="金额"
          rules={[{ required: true, message: '请输入金额' }]}
        >
          <InputNumber
            style={{ width: '200px' }}
            precision={2}
            min={0}
            step={0.01}
          />
        </Form.Item>

        <Form.Item
          name="currency"
          label="货币"
          rules={[{ required: true, message: '请选择货币' }]}
        >
          <Select style={{ width: '120px' }}>
            {Object.values(Currency).map(currency => (
              <Option key={currency} value={currency}>
                {currency}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Space>

      {/* 日期信息 */}
      <Space>
        <Form.Item
          name="date"
          label="交易日期"
          rules={[{ required: true, message: '请选择交易日期' }]}
        >
          <DatePicker showTime />
        </Form.Item>

        <Form.Item name="postedDate" label="过账日期">
          <DatePicker showTime />
        </Form.Item>
      </Space>

      {/* 分类和状态 */}
      <Form.Item
        name="category"
        label="交易类别"
        rules={[{ required: true, message: '请选择交易类别' }]}
      >
        <Select>
          {Object.values(TransactionCategory).map(category => (
            <Option key={category} value={category}>
              {category}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="交易状态"
        rules={[{ required: true, message: '请选择交易状态' }]}
      >
        <Select>
          {Object.values(TransactionStatus).map(status => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* 描述信息 */}
      <Form.Item
        name="merchant"
        label="商家"
        rules={[{ required: true, message: '请输入商家名称' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="描述"
        rules={[{ required: true, message: '请输入交易描述' }]}
      >
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item name="notes" label="备注">
        <Input.TextArea rows={2} />
      </Form.Item>

      {/* 标签 */}
      <Form.Item name="tags" label="标签">
        <Select mode="tags" style={{ width: '100%' }} />
      </Form.Item>

      {/* 按钮组 */}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
