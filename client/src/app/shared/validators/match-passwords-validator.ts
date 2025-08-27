import { FormGroup, ValidatorFn } from "@angular/forms";

export function matchPassValidator(pass1ctr:string, pass2ctr:string): ValidatorFn {
    return (control) => {
        const group = control as FormGroup;
        const pass1 = group.get(pass1ctr);
        const pass2 = group.get(pass2ctr);
        return pass1?.value===pass2?.value ? null : {matchPassValidator: true}
    }
}