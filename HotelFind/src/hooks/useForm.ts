import { useState } from 'react';

const useForm = (initialValues: any, validate: (arg0: any) => any) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });

        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);
        }
    };

    const handleSubmit = (e: { preventDefault: () => void; }, callback: (arg0: any) => void) => {
        e.preventDefault();
        if (Object.keys(errors).length === 0) {
            callback(values);
        }
    };

    return {
        values,
        errors,
        handleChange,
        handleSubmit,
    };
};

export default useForm;