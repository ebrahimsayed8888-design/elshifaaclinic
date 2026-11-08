// ⚠️ Updated with your exact Supabase credentials
const supabaseUrl = 'https://nczxlzylbrspnifvnatu.supabase.co'; 
const supabaseKey = 'sb_publishable_vcc_y6cZRi2ZO5-KERDGxw_GR3BeI0l'; 

const { createClient } = window.supabase;
const _supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'advancedAppointmentForm') {
        e.preventDefault(); // Stop native page reload immediately

        const pName = document.getElementById('patientName').value.trim();
        const pPhone = document.getElementById('patientPhone').value.trim();
        const pDOB = document.getElementById('patientDOB').value;
        const pAddress = document.getElementById('patientAddress').value.trim();

        const selectedDoctorId = document.getElementById('doctorSelect').value;
        const appDate = document.getElementById('appointmentDate').value;
        const appTime = document.getElementById('appointmentTime').value;
        const appPurpose = document.getElementById('appointmentPurpose').value.trim();

        try {
            // STEP 1: Insert fresh record into PATIENT table
            const { data: patientData, error: patientError } = await _supabase
                .from('PATIENT')
                .insert([
                    { Name: pName, Phone: pPhone, Date_of_Birth: pDOB, Address: pAddress }
                ])
                .select(); 

            if (patientError) {
                alert('Database Error (PATIENT Table): ' + patientError.message);
                return;
            }

            if (!patientData || patientData.length === 0) {
                alert('System Execution Error: Failed to retrieve data from PATIENT.');
                return;
            }
            const generatedPatientId = patientData[0].Patient_ID;

            // STEP 2: Use Patient_ID to construct record inside APPOINTMENT table
            const { data: appointmentData, error: appointmentError } = await _supabase
                .from('APPOINTMENT')
                .insert([
                    { 
                        Date: appDate, 
                        Time: appTime, 
                        Purpose: appPurpose, 
                        Patient_ID: generatedPatientId, 
                        Doctor_ID: parseInt(selectedDoctorId) 
                    }
                ])
                .select();

            if (appointmentError) {
                alert('Database Error (APPOINTMENT Table): ' + appointmentError.message);
                return;
            }

            if (!appointmentData || appointmentData.length === 0) {
                alert('System Execution Error: Failed to retrieve data from APPOINTMENT.');
                return;
            }
            const generatedAppointmentId = appointmentData[0].Appointment_ID;

            // STEP 3: Issue matching invoice in BILL table
            const { error: billError } = await _supabase
                .from('BILL')
                .insert([
                    { 
                        Amount: 150.00, 
                        Payment_Status: 'Unpaid', 
                        Appointment_ID: generatedAppointmentId 
                    }
                ]);

            if (billError) {
                alert('Database Error (BILL Table): ' + billError.message);
                return;
            }

            alert('Success! Patient profile created, clinical appointment scheduled, and billing transaction invoice generated successfully.');
            e.target.reset(); 

        } catch (error) {
            console.error('Critical System Malfunction Exception:', error);
            alert('An unexpected systemic execution failure occurred: ' + error.message);
        }
    }
});
