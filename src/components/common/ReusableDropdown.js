import { Select } from 'antd';

const { Option } = Select;

const ReusableDropdown = ({
  data = [],
  valueField = 'id',
  labelField = 'name',
  placeholder = 'Select an option',
  loading = false,
  allowClear = true,
  showSearch = true,
  defaultOption = true,
  value,
  onChange,
  disabled = false,
  ...rest
}) => {
  return (
    <Select
      showSearch={showSearch}
      allowClear={allowClear}
      placeholder={placeholder}
      loading={loading}
      optionFilterProp="children"
      onChange={onChange}
      onSelect={onChange}
      value={value}
      disabled={disabled}
      {...rest}
    >
      {defaultOption && (
        <Option value="" disabled>
          {placeholder}
        </Option>
      )}
      {data.map((item) => (
        <Option key={item[valueField]} value={item[valueField]}>
          {item[labelField]}
        </Option>
      ))}
    </Select>
  );
};

export default ReusableDropdown;