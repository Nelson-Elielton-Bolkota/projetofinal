export class FormService {
  static setupInputMasks() {

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length > 0) {
          value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
          if (value.length > 10) {
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
          }
        }
        
        e.target.value = value;
      });
    }
    

    const cepInput = document.getElementById('cep');
    if (cepInput) {
      cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);
        
        if (value.length > 5) {
          value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        
        e.target.value = value;
      });


      cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length === 8) {
          try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (response.ok) {
              const data = await response.json();
              if (!data.erro) {
                document.getElementById('address').value = data.logradouro;
                document.getElementById('neighborhood').value = data.bairro;
                document.getElementById('city').value = data.localidade;
                document.getElementById('state').value = data.uf;
              }
            }
          } catch (error) {
            console.error('Erro ao buscar CEP:', error);
          }
        }
      });
    }
  }

  static validateForm() {
    const requiredFields = ['name', 'email', 'phone', 'cep', 'address', 'address-number', 'neighborhood', 'city', 'state'];
    let isValid = true;
    
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (field && !field.value.trim()) {
        field.style.borderColor = '#ff4444';
        isValid = false;
      } else if (field) {
        field.style.borderColor = '';
      }
    });
    
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox && !termsCheckbox.checked) {
      isValid = false;
    }
    
    return isValid;
  }

  static getCustomerData() {
    return {
      name: document.getElementById('name').value.trim() || '',
      email: document.getElementById('email').value.trim() || '',
      phone: document.getElementById('phone').value.replace(/\D/g, '') || '',
      address: {
        zip_code: document.getElementById('cep').value.replace(/\D/g, '') || '',
        street_name: document.getElementById('address').value.trim() || '',
        street_number: document.getElementById('address-number').value.trim() || '',
        neighborhood: document.getElementById('neighborhood').value.trim() || '',
        city: document.getElementById('city').value.trim() || '',
        federal_unit: document.getElementById('state').value || ''
      }
    };
  }
}